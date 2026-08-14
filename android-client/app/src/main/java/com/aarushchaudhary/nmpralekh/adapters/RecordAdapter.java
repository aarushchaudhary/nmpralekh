package com.aarushchaudhary.nmpralekh.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.aarushchaudhary.nmpralekh.R;
import com.google.android.material.button.MaterialButton;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class RecordAdapter extends RecyclerView.Adapter<RecordAdapter.ViewHolder> {

    public interface RecordBinder {
        String getTitle(JsonObject record);
        String getSubtitle(JsonObject record);
        String getBadgeText(JsonObject record);  // return null to hide badge
        String getExtraData(JsonObject record);  // return null to hide extra
        int getBadgeColor(JsonObject record); // background color resource or 0
        int getBadgeTextColor(JsonObject record); // text color or 0
    }

    public interface OnRecordActionListener {
        void onEdit(JsonObject record);
        void onDelete(JsonObject record);
    }

    private List<JsonObject> records = new ArrayList<>();
    private final RecordBinder binder;
    private final OnRecordActionListener listener;
    private boolean isReadOnly = false;

    public RecordAdapter(RecordBinder binder, OnRecordActionListener listener) {
        this.binder = binder;
        this.listener = listener;
    }

    public void setReadOnly(boolean readOnly) {
        isReadOnly = readOnly;
        notifyDataSetChanged();
    }

    public void setRecords(List<JsonObject> records) {
        this.records = records;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_record, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        JsonObject record = records.get(position);

        holder.tvTitle.setText(binder.getTitle(record));
        holder.tvSubtitle.setText(binder.getSubtitle(record));

        // Badge
        String badge = binder.getBadgeText(record);
        if (badge != null && !badge.isEmpty()) {
            holder.tvBadge.setText(badge);
            holder.tvBadge.setVisibility(View.VISIBLE);
            int bgColor = binder.getBadgeColor(record);
            if (bgColor != 0) {
                holder.tvBadge.getBackground().setTint(bgColor);
            }
            int textColor = binder.getBadgeTextColor(record);
            if (textColor != 0) {
                holder.tvBadge.setTextColor(textColor);
            }
        } else {
            holder.tvBadge.setVisibility(View.GONE);
        }

        // Extra text
        String extra = binder.getExtraData(record);
        if (extra != null && !extra.isEmpty()) {
            holder.tvExtra.setText(extra);
            holder.tvExtra.setVisibility(View.VISIBLE);
        } else {
            holder.tvExtra.setVisibility(View.GONE);
        }

        // Pending audit or Read-only
        boolean isPending = record.has("pending_audit") && !record.get("pending_audit").isJsonNull();
        if (isPending) {
            holder.tvPending.setVisibility(View.VISIBLE);
            holder.layoutActions.setVisibility(View.GONE);
        } else {
            holder.tvPending.setVisibility(View.GONE);
            if (isReadOnly) {
                holder.layoutActions.setVisibility(View.GONE);
            } else {
                holder.layoutActions.setVisibility(View.VISIBLE);
                holder.btnEdit.setOnClickListener(v -> listener.onEdit(record));
                holder.btnDelete.setOnClickListener(v -> listener.onDelete(record));
            }
        }
    }

    @Override
    public int getItemCount() {
        return records.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvSubtitle, tvExtra, tvBadge, tvPending;
        MaterialButton btnEdit, btnDelete;
        LinearLayout layoutActions;

        ViewHolder(View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvSubtitle = itemView.findViewById(R.id.tvSubtitle);
            tvExtra = itemView.findViewById(R.id.tvExtra);
            tvBadge = itemView.findViewById(R.id.tvBadge);
            tvPending = itemView.findViewById(R.id.tvPending);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
            layoutActions = itemView.findViewById(R.id.layoutActions);
        }
    }
}
