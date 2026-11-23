package com.aarushchaudhary.nmpralekh.fragments;
import java.util.Map;
import retrofit2.Call;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.gson.JsonObject;

public class ReceivedMISDataFragment extends BaseRecordFragment {

    public static ReceivedMISDataFragment newInstance() {
        return new ReceivedMISDataFragment();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        adapter.setOnItemClick(this::showReport);
    }

    private void showReport(JsonObject record) {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(reportName(record))
                .setMessage("By: " + jsonStr(record, "created_by_name")
                        + "\nPeriod: " + jsonStr(record, "date_from") + " to " + jsonStr(record, "date_to")
                        + "\n\n" + jsonStr(record, "data_content"))
                .setPositiveButton("Close", null)
                .show();
    }

    private String reportName(JsonObject record) {
        return "#" + jsonStr(record, "id") + " " + jsonStr(record, "title");
    }

    // when this viewer's copy arrived (ISO timestamp, date part)
    private String receivedOn(JsonObject record) {
        String key = "super_admin".equals(sessionManager.getRole()) ? "sent_to_super_admin_at" : "sent_to_admin_at";
        String at = jsonStr(record, key);
        return at.length() >= 10 ? at.substring(0, 10) : "—";
    }

    @Override
    protected int getPageSize() {
        return 10;
    }

    @Override
    protected String getEndpoint() {
        return "/api/export/reports/received/";
    }

    @Override
    protected String getPageTitle() {
        return "Received MIS Data";
    }

    @Override
    protected String getPageSubtitle() {
        return "Tap a report to read it";
    }

    @Override
    protected boolean isReadOnly() {
        return true;
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return reportName(record);
            }

            @Override
            public String getSubtitle(JsonObject record) {
                return "From: " + jsonStr(record, "created_by_name") + "\nReceived: " + receivedOn(record);
            }

            @Override
            public RecordAdapter.BadgeStyle getBadgeStyle(JsonObject record) {
                return RecordAdapter.BadgeStyle.DARK; // "Received"
            }

            @Override
            public String getBadgeText(JsonObject record) {
                return "Received";
            }

            @Override
            public String getExtraData(JsonObject record) {
                return null; // the content opens in a popup on tap
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        // Read only
    }

    @Override
    protected JsonObject collectFormData() {
        return new JsonObject();
    }

    @Override
    protected boolean validateForm() {
        return true;
    }

    @Override
    protected Call<JsonObject> getApiCall(Map<String, String> params) {
        return apiService.getReceivedReports(params);
    }

    @Override
    protected Call<JsonObject> createRecordCall(JsonObject data) {
        return null;
    }

    @Override
    protected Call<JsonObject> updateRecordCall(int id, JsonObject data) {
        return null;
    }

    @Override
    protected Call<JsonObject> deleteRecordCall(int id) {
        return null;
    }
}
