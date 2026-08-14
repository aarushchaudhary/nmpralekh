package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class ReceivedMISDataFragment extends BaseRecordFragment {

    public static ReceivedMISDataFragment newInstance() {
        return new ReceivedMISDataFragment();
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
        return "View reports submitted by coordinators";
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
                String name = jsonStr(record, "name");
                if (name == null || name.isEmpty()) {
                    name = "MIS Report";
                }
                return name + " (" + jsonStr(record, "created_by_school_name") + ")";
            }

            @Override
            public String getSubtitle(JsonObject record) {
                return "From: " + jsonStr(record, "created_by_name") + "\nPeriod: " + jsonStr(record, "date_from") + " to " + jsonStr(record, "date_to");
            }

            @Override
            public String getBadgeText(JsonObject record) {
                return "Received";
            }

            @Override
            public int getBadgeColor(JsonObject record) {
                return 0xFFD1FAE5; // emerald-50 (or green)
            }

            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0xFF065F46; // emerald-700
            }

            @Override
            public String getExtraData(JsonObject record) {
                // Short preview of data content
                String content = jsonStr(record, "data_content");
                if (content != null && content.length() > 50) {
                    content = content.substring(0, 50) + "...";
                }
                return content != null ? content : "";
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
}
