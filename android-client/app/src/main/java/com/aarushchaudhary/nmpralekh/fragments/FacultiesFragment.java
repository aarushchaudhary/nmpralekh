package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class FacultiesFragment extends BaseRecordFragment {

    public static FacultiesFragment newInstance() {
        return new FacultiesFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/users/school-faculties/";
    }

    @Override
    protected String getPageTitle() {
        return "Faculties";
    }

    @Override
    protected String getPageSubtitle() {
        return "View school faculties";
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
                return jsonStr(record, "full_name");
            }

            @Override
            public String getSubtitle(JsonObject record) {
                return jsonStr(record, "email") + " · " + jsonStr(record, "username");
            }

            @Override
            public String getBadgeText(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? "Active" : "Inactive";
            }

            @Override
            public int getBadgeColor(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? 0xFFD1FAE5 : 0xFFF3F4F6; // green / gray
            }

            @Override
            public int getBadgeTextColor(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? 0xFF065F46 : 0xFF374151;
            }

            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "school_code");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        // Read only, no form needed
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
