package com.aarushchaudhary.nmpralekh;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.mockwebserver.Dispatcher;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 * The real HTTP client (cookies, CSRF header, refresh-once-and-retry) against a fake server
 * that behaves like the Django one: the access token expires, /api/auth/refresh/ rotates it.
 */
public class ApiClientTest {

    private MockWebServer server;
    private OkHttpClient client;
    private final AtomicInteger refreshCalls = new AtomicInteger();
    private volatile boolean loginWorks = true;
    private volatile boolean refreshWorks = true;
    private final AtomicBoolean firstRefreshTokenUsed = new AtomicBoolean();
    private volatile String lastCsrfHeader;

    @Before
    public void setUp() throws Exception {
        ApiClient.clearCookies();
        server = new MockWebServer();
        server.setDispatcher(new Dispatcher() {
            @Override
            public MockResponse dispatch(RecordedRequest request) {
                String cookies = request.getHeader("Cookie");
                switch (request.getPath()) {
                    case "/api/auth/login/":
                        if (!loginWorks) return new MockResponse().setResponseCode(401);
                        return new MockResponse().setResponseCode(200)
                                .addHeader("Set-Cookie", "access_token=old; Path=/")
                                .addHeader("Set-Cookie", "refresh_token=r1; Path=/")
                                .addHeader("Set-Cookie", "csrftoken=csrf-1; Path=/");
                    case "/api/auth/refresh/":
                        refreshCalls.incrementAndGet();
                        // like Django: needs the refresh cookie, and each refresh token works once (rotation)
                        boolean valid = cookies != null && cookies.contains("refresh_token=r1")
                                && !firstRefreshTokenUsed.getAndSet(true);
                        if (!refreshWorks || !valid) return new MockResponse().setResponseCode(401);
                        return new MockResponse().setResponseCode(200)
                                .addHeader("Set-Cookie", "access_token=new; Path=/")
                                .addHeader("Set-Cookie", "refresh_token=r2; Path=/");
                    case "/api/records/":
                        lastCsrfHeader = request.getHeader("X-CSRFToken");
                        // only the refreshed access token is still valid
                        boolean fresh = cookies != null && cookies.contains("access_token=new");
                        return new MockResponse().setResponseCode(fresh ? 200 : 401).setBody(fresh ? "ok" : "");
                    default:
                        return new MockResponse().setResponseCode(404);
                }
            }
        });
        server.start();
        client = ApiClient.buildHttpClient(false);
    }

    @After
    public void tearDown() throws Exception {
        server.shutdown();
        ApiClient.clearCookies();
    }

    private Response post(String path) throws Exception {
        return client.newCall(new Request.Builder().url(server.url(path))
                .post(RequestBody.create(new byte[0])).build()).execute();
    }

    private Response get(String path) throws Exception {
        return client.newCall(new Request.Builder().url(server.url(path)).build()).execute();
    }

    private void login() throws Exception {
        try (Response r = post("/api/auth/login/")) {
            assertEquals(200, r.code());
        }
    }

    @Test
    public void expiredAccessTokenIsRefreshedOnceAndTheRequestRetried() throws Exception {
        login();
        try (Response r = get("/api/records/")) {
            assertEquals(200, r.code());
            assertEquals("ok", r.body().string());
        }
        assertEquals(1, refreshCalls.get());
        // login, the refused request, the refresh, the retry
        assertEquals(4, server.getRequestCount());
    }

    @Test
    public void whenTheRefreshFailsTooTheScreenGetsThe401AndNothingLoops() throws Exception {
        login();
        refreshWorks = false;
        try (Response r = get("/api/records/")) {
            assertEquals(401, r.code());
        }
        assertEquals(1, refreshCalls.get());
        assertEquals(3, server.getRequestCount()); // login, the refused request, the refresh: no retry
    }

    @Test
    public void aFailedLoginNeverTriesToRefresh() throws Exception {
        loginWorks = false;
        try (Response r = post("/api/auth/login/")) {
            assertEquals(401, r.code());
        }
        assertEquals(0, refreshCalls.get());
        assertEquals(1, server.getRequestCount());
    }

    @Test
    public void theCsrfCookieIsSentBackAsTheCsrfHeader() throws Exception {
        login();
        post("/api/records/").close();
        assertEquals("csrf-1", lastCsrfHeader);
    }

    @Test
    public void manyRequestsHittingAnExpiredTokenTogetherRefreshOnlyOnce() throws Exception {
        // refresh tokens rotate: a second refresh with the old one would sign the user out
        login();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        try {
            List<Callable<Integer>> calls = new ArrayList<>();
            for (int i = 0; i < 8; i++) {
                calls.add(() -> {
                    try (Response r = get("/api/records/")) { return r.code(); }
                });
            }
            for (Future<Integer> code : pool.invokeAll(calls)) assertEquals(200, (int) code.get());
        } finally {
            pool.shutdownNow();
        }
        assertEquals(1, refreshCalls.get());
    }

    @Test
    public void signingOutClearsTheSavedTokens() throws Exception {
        login();
        ApiClient.clearCookies();
        try (Response r = get("/api/records/")) {
            assertEquals(401, r.code());
        }
        // the refresh is tried, but without a refresh cookie the server refuses it, so the user is signed out
        assertEquals(1, refreshCalls.get());
    }
}
