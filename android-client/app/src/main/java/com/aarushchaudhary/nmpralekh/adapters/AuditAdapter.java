package com.aarushchaudhary.nmpralekh.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.aarushchaudhary.nmpralekh.R;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class AuditAdapter extends RecyclerView.Adapter<AuditAdapter.AuditViewHolder> {

    private List<JsonObject> audits = new ArrayList<>();
    private final Context context;
    private final boolean isHistory;
    private final OnAuditActionListener listener;

    public interface OnAuditActionListener {
        void onApprove(int id);
        void onReject(int id);
    }

    public AuditAdapter(Context context, boolean isHistory, OnAuditActionListener listener) {
        this.context = context;
        this.isHistory = isHistory;
        this.listener = listener;
    }

    public void setAudits(List<JsonObject> audits) {
        this.audits = audits != null ? audits : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public AuditViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_audit, parent, false);
        return new AuditViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull AuditViewHolder holder, int position) {
        JsonObject audit = audits.get(position);
        
        String tableName = getString(audit, "table_name");
        String recordId = getString(audit, "record_id");
        String action = getString(audit, "action");
        String requestedAt = getString(audit, "requested_at");

        if (requestedAt.length() > 10) {
            requestedAt = requestedAt.substring(0, 10);
        }

        JsonObject reqBy = audit.has("requested_by_detail") && !audit.get("requested_by_detail").isJsonNull()
                ? audit.getAsJsonObject("requested_by_detail") : null;
        String requestedByStr = reqBy != null ? getString(reqBy, "full_name") : "Unknown User";

        holder.tvTableName.setText(tableName.replace("_", " ") + " — Record #" + recordId);
        holder.tvRequestedBy.setText("Requested by " + requestedByStr + " · " + requestedAt);

        holder.tvActionBadge.setText(action);
        if ("DELETE".equals(action)) {
            holder.tvActionBadge.setTextColor(0xFF991B1B); // red-800
            holder.tvActionBadge.setBackgroundColor(0xFFFEE2E2); // red-100
        } else {
            holder.tvActionBadge.setTextColor(0xFF92400E); // yellow-800
            holder.tvActionBadge.setBackgroundColor(0xFFFEF3C7); // yellow-100
        }

        if (isHistory) {
            holder.layoutActions.setVisibility(View.GONE);
            String status = getString(audit, "status");
            holder.tvActionBadge.setText(action + " (" + status + ")");
            if ("approved".equalsIgnoreCase(status)) {
                holder.tvActionBadge.setTextColor(0xFF065F46); // green-800
                holder.tvActionBadge.setBackgroundColor(0xFFD1FAE5); // green-100
            } else if ("rejected".equalsIgnoreCase(status)) {
                holder.tvActionBadge.setTextColor(0xFF991B1B);
                holder.tvActionBadge.setBackgroundColor(0xFFFEE2E2);
            }
        } else {
            holder.layoutActions.setVisibility(View.VISIBLE);
            int auditId = audit.has("id") ? audit.get("id").getAsInt() : -1;
            holder.btnApprove.setOnClickListener(v -> {
                if (listener != null) listener.onApprove(auditId);
            });
            holder.btnReject.setOnClickListener(v -> {
                if (listener != null) listener.onReject(auditId);
            });
        }

        // Show changes if needed
        StringBuilder diffStr = new StringBuilder();
        if (audit.has("old_data") && !audit.get("old_data").isJsonNull() && audit.has("new_data") && !audit.get("new_data").isJsonNull()) {
            JsonObject oldData = audit.getAsJsonObject("old_data");
            JsonObject newData = audit.getAsJsonObject("new_data");
            
            for (String key : oldData.keySet()) {
                if (key.equals("id") || key.equals("created_at") || key.equals("updated_at") || key.equals("created_by") || key.equals("is_deleted") || key.equals("pending_audit")) continue;
                String oldVal = getString(oldData, key);
                String newVal = getString(newData, key);
                if (!oldVal.equals(newVal)) {
                    diffStr.append(key).append(": ").append(oldVal).append(" -> ").append(newVal).append("\n");
                }
            }
        }
        if (diffStr.length() > 0) {
            holder.tvChanges.setVisibility(View.VISIBLE);
            holder.tvChanges.setText(diffStr.toString().trim());
        } else {
            holder.tvChanges.setVisibility(View.GONE);
        }
    }

    private String getString(JsonObject obj, String key) {
        if (obj != null && obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return "";
    }

    @Override
    public int getItemCount() {
        return audits.size();
    }

    static class AuditViewHolder extends RecyclerView.ViewHolder {
        TextView tvTableName, tvRequestedBy, tvActionBadge, tvChanges;
        LinearLayout layoutActions;
        View btnApprove, btnReject;

        public AuditViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTableName = itemView.findViewById(R.id.tvTableName);
            tvRequestedBy = itemView.findViewById(R.id.tvRequestedBy);
            tvActionBadge = itemView.findViewById(R.id.tvActionBadge);
            tvChanges = itemView.findViewById(R.id.tvChanges);
            layoutActions = itemView.findViewById(R.id.layoutActions);
            btnApprove = itemView.findViewById(R.id.btnApprove);
            btnReject = itemView.findViewById(R.id.btnReject);
        }
    }
}
