from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.db.models import F

from apps.accounts.permissions import IsMaster, IsAnyRole, IsServiceAdmin
from apps.service.models import ErrorTicket, ErrorOccurrence, BugReport
from apps.service.serializers import (
    ErrorTicketListSerializer, ErrorTicketDetailSerializer,
    ReportErrorSerializer, BugReportCreateSerializer,
    BugReportListSerializer, TicketStatusUpdateSerializer,
    BugReportAdminUpdateSerializer,
)
from config.pagination import StandardPagination


# ─────────────────────────────────────────────
# ERROR INGESTION  (called by frontend silently)
# ─────────────────────────────────────────────
class ReportErrorView(APIView):
    """
    POST /api/service/report-error/

    Receives automatic error reports from the React frontend.
    Any authenticated user can POST — this endpoint is intentionally
    very permissive because it's called in the background on crashes.

    Deduplication:
      1. Build a fingerprint from error_type + error_message + url_path.
      2. get_or_create the ErrorTicket using that fingerprint.
      3. On an existing ticket, increment counters.
      4. Always create one ErrorOccurrence row for the timeline.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.Serializer

    def post(self, request):
        serializer = ReportErrorSerializer(data=request.data)
        if not serializer.is_valid():
            # Silently accept even malformed payloads — we don't want to
            # surface a secondary error while handling the primary one.
            return Response({'ok': False}, status=status.HTTP_200_OK)

        data = serializer.validated_data

        # Build dedup key
        fingerprint = ErrorTicket.make_fingerprint(
            data.get('error_type', 'Error'),
            data.get('error_message', ''),
            data.get('url_path', ''),
        )

        # Truncate title to first 200 chars of message (no newlines)
        title = (data.get('error_message', 'Unknown error') or 'Unknown error')
        title = title.split('\n')[0][:200]

        with transaction.atomic():
            ticket, created = ErrorTicket.objects.get_or_create(
                fingerprint=fingerprint,
                defaults={
                    'title':           title,
                    'source':          data.get('source', 'frontend_js'),
                    'error_type':      data.get('error_type', 'Error'),
                    'error_message':   data.get('error_message', ''),
                    'stack_trace':     data.get('stack_trace', ''),
                    'component_stack': data.get('component_stack', ''),
                    'url_path':        data.get('url_path', ''),
                    'http_status':     data.get('http_status'),
                    'api_endpoint':    data.get('api_endpoint', ''),
                }
            )

            if not created:
                # Bump counters on existing ticket
                ErrorTicket.objects.filter(pk=ticket.pk).update(
                    occurrence_count=F('occurrence_count') + 1,
                )
                # Reopen a previously closed ticket if the error recurs
                if ticket.status == 'closed':
                    ErrorTicket.objects.filter(pk=ticket.pk).update(
                        status='open',
                        resolved_at=None,
                        resolved_by=None,
                    )

            # Track affected users (only count each user once per ticket)
            user = request.user
            already_seen = ErrorOccurrence.objects.filter(
                ticket=ticket, user=user
            ).exists()

            ErrorOccurrence.objects.create(
                ticket=ticket,
                user=user,
                url_path=data.get('url_path', ''),
                user_agent=data.get('user_agent', ''),
                extra=data.get('extra'),
            )

            if not already_seen:
                ErrorTicket.objects.filter(pk=ticket.pk).update(
                    affected_users_count=F('affected_users_count') + 1,
                )

        return Response({'ok': True, 'ticket_id': ticket.id}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# BUG REPORTS  (manual, from any logged-in user)
# ─────────────────────────────────────────────
class BugReportCreateView(generics.CreateAPIView):
    """
    POST /api/service/bug-reports/
    Any logged-in user can submit a bug report.
    """
    serializer_class   = BugReportCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        return Response(
            {'ok': True, 'report_id': report.id},
            status=status.HTTP_201_CREATED
        )


# ─────────────────────────────────────────────
# ADMIN VIEWS  (master only)
# ─────────────────────────────────────────────
class ErrorTicketListView(generics.ListAPIView):
    """
    GET /api/service/tickets/
    Returns paginated, filterable list of error tickets.
    """
    serializer_class   = ErrorTicketListSerializer
    permission_classes = [IsServiceAdmin]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = ErrorTicket.objects.all()

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        source_filter = self.request.query_params.get('source')
        if source_filter:
            qs = qs.filter(source=source_filter)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(url_path__icontains=search)

        sort = self.request.query_params.get('sort', '-last_seen')
        allowed_sorts = [
            'last_seen', '-last_seen',
            'first_seen', '-first_seen',
            'occurrence_count', '-occurrence_count',
            'affected_users_count', '-affected_users_count',
        ]
        if sort in allowed_sorts:
            qs = qs.order_by(sort)

        return qs.select_related('resolved_by')


class ErrorTicketDetailView(generics.RetrieveAPIView):
    """
    GET /api/service/tickets/<id>/
    """
    serializer_class   = ErrorTicketDetailSerializer
    permission_classes = [IsServiceAdmin]
    queryset           = ErrorTicket.objects.select_related('resolved_by')


class ErrorTicketStatusView(APIView):
    """
    POST /api/service/tickets/<id>/status/
    Update ticket status (open → investigating → resolved → wontfix).
    """
    permission_classes = [IsServiceAdmin]
    serializer_class = serializers.Serializer

    def post(self, request, pk):
        try:
            ticket = ErrorTicket.objects.get(pk=pk)
        except ErrorTicket.DoesNotExist:
            return Response({'detail': 'Ticket not found'}, status=404)

        serializer = TicketStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ticket.status = data['status']
        if data['status'] == 'closed':
            ticket.resolved_by   = request.user
            ticket.resolved_at   = timezone.now()
            ticket.resolution_note = data.get('resolution_note', '')
        else:
            ticket.resolved_by   = None
            ticket.resolved_at   = None
        ticket.save()

        return Response({'ok': True, 'status': ticket.status})


class BugReportListView(generics.ListAPIView):
    """
    GET /api/service/bug-reports/
    """
    serializer_class   = BugReportListSerializer
    permission_classes = [IsServiceAdmin]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = BugReport.objects.select_related('user', 'linked_ticket')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        severity_filter = self.request.query_params.get('severity')
        if severity_filter:
            qs = qs.filter(severity=severity_filter)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs


class BugReportDetailView(generics.RetrieveUpdateAPIView):
    """
    GET / PATCH /api/service/bug-reports/<id>/
    """
    permission_classes = [IsServiceAdmin]
    queryset           = BugReport.objects.select_related('user', 'linked_ticket')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return BugReportAdminUpdateSerializer
        return BugReportListSerializer


class ServiceDashboardStatsView(APIView):
    """
    GET /api/service/stats/
    Quick stats card data for the service portal homepage.
    """
    permission_classes = [IsServiceAdmin]
    serializer_class = serializers.Serializer

    def get(self, request):
        from django.db.models import Count, Sum
        import psutil
        import shutil
        from django.db import connection
        from django.core.cache import cache

        total_tickets   = ErrorTicket.objects.count()
        open_tickets    = ErrorTicket.objects.filter(status='open').count()
        investigating   = ErrorTicket.objects.filter(status__in=['planning', 'fixing', 'testing']).count()
        resolved_today  = ErrorTicket.objects.filter(
            status='closed',
            resolved_at__date=timezone.now().date()
        ).count()
        total_reports   = BugReport.objects.count()
        open_reports    = BugReport.objects.filter(status='open').count()
        critical_reports = BugReport.objects.filter(
            severity='critical', status__in=['open', 'in_review']
        ).count()

        # Top 5 most-impacted tickets
        top_tickets = ErrorTicket.objects.filter(
            status__in=['open', 'planning', 'fixing', 'testing']
        ).order_by('-affected_users_count')[:5].values(
            'id', 'title', 'affected_users_count', 'occurrence_count', 'source'
        )

        # System and Service Checks
        db_status = 'offline'
        db_size = 'Unknown'
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = 'online'
                cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()))")
                db_size = cursor.fetchone()[0]
        except Exception:
            pass

        redis_status = 'offline'
        try:
            if cache.set('redis_check', 1, timeout=1):
                redis_status = 'online'
        except Exception:
            pass

        cpu_usage = psutil.cpu_percent(interval=0.1)
        ram = psutil.virtual_memory()
        disk = shutil.disk_usage('/')
        
        system_stats = {
            'cpu': cpu_usage,
            'ram_used': ram.used,
            'ram_total': ram.total,
            'ram_percent': ram.percent,
            'disk_used': disk.used,
            'disk_total': disk.total,
            'disk_percent': round(disk.used / disk.total * 100, 1) if disk.total else 0,
        }

        # Check Nginx via systemctl (Ubuntu/systemd)
        nginx_status = 'offline'
        try:
            import subprocess
            result = subprocess.run(
                ['systemctl', 'is-active', 'nginx'],
                capture_output=True, text=True, timeout=2
            )
            nginx_status = 'online' if result.stdout.strip() == 'active' else 'offline'
        except Exception:
            pass

        services = [
            {'name': 'Django',     'status': 'online'},
            {'name': 'PostgreSQL', 'status': db_status},
            {'name': 'PgBouncer', 'status': db_status},
            {'name': 'Redis',      'status': redis_status},
            {'name': 'Celery',     'status': 'online' if redis_status == 'online' else 'offline'},
            {'name': 'Nginx',      'status': nginx_status},
        ]


        return Response({
            'total_tickets':   total_tickets,
            'open_tickets':    open_tickets,
            'investigating':   investigating,
            'resolved_today':  resolved_today,
            'total_reports':   total_reports,
            'open_reports':    open_reports,
            'critical_reports': critical_reports,
            'top_tickets':     list(top_tickets),
            'system_stats':    system_stats,
            'services':        services,
            'db_size':         db_size,
        })


class ApiStatusView(APIView):
    """
    GET /api/service/api-status/
    Returns the status of major API groups (Online, Facing Issues, Offline).
    """
    permission_classes = [IsServiceAdmin]
    serializer_class = serializers.Serializer

    def get(self, request):
        from django.db import connection
        from django.urls import get_resolver
        from django.urls.resolvers import URLPattern, URLResolver
        import re

        def extract_urls(resolver, prefix=''):
            urls = []
            for pattern in resolver.url_patterns:
                if isinstance(pattern, URLResolver):
                    pattern_str = str(pattern.pattern)
                    urls.extend(extract_urls(pattern, prefix + pattern_str))
                elif isinstance(pattern, URLPattern):
                    path = prefix + str(pattern.pattern)
                    if path.startswith('api/'):
                        # Clean up regex syntax for display
                        clean_path = '/' + path
                        clean_path = re.sub(r'\^|\$', '', clean_path)
                        clean_path = re.sub(r'\(\?P<([^>]+)>.*?\)', r'{\1}', clean_path)
                        clean_path = re.sub(r'<([^>]+)>', r'{\1}', clean_path)
                        urls.append(clean_path)
            return urls
            
        all_api_urls = extract_urls(get_resolver())
        
        # Group them
        groups = {}
        for url in all_api_urls:
            parts = [p for p in url.split('/') if p]
            if len(parts) >= 2:
                category = parts[1].title() + ' API'
            else:
                category = 'Core API'
                
            if category not in groups:
                groups[category] = []
            groups[category].append(url)

        # Check if database is offline
        db_offline = False
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_offline = True

        open_tickets = []
        if not db_offline:
            open_tickets = list(ErrorTicket.objects.filter(
                status__in=['open', 'planning', 'fixing', 'testing']
            ).values_list('api_endpoint', flat=True))

        status_data = []
        for category, urls in groups.items():
            group_status = 'Offline' if db_offline else 'Online'
            endpoints = []
            
            for url in sorted(list(set(urls))):
                endpoint_status = 'Offline' if db_offline else 'Online'
                
                if not db_offline:
                    static_part = url.split('{')[0]
                    for ticket_ep in open_tickets:
                        if ticket_ep and static_part and ticket_ep.startswith(static_part) and len(static_part) > 5:
                            endpoint_status = 'Facing Issues'
                            group_status = 'Facing Issues'
                            break
                            
                endpoints.append({
                    'path': url,
                    'status': endpoint_status
                })
                
            status_data.append({
                'name': category,
                'status': group_status,
                'endpoints': endpoints
            })

        return Response(status_data)