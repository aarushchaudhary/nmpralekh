package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class SchoolActivitiesFragment extends BaseRecordFragment {

    public static SchoolActivitiesFragment newInstance() {
        return new SchoolActivitiesFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/school-activities/";
    }

    @Override
    protected String getPageTitle() {
        return "School Activities";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage school activity records";
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return jsonStr(record, "name");
            }
            @Override
            public String getSubtitle(JsonObject record) {
                return jsonStr(record, "school_name") + " · " + jsonStr(record, "date");
            }
            @Override
            public String getBadgeText(JsonObject record) {
                boolean isSchoolWide = record.has("is_school_wide") && !record.get("is_school_wide").isJsonNull() && record.get("is_school_wide").getAsBoolean();
                return isSchoolWide ? "Yes" : "No";
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                boolean isSchoolWide = record.has("is_school_wide") && !record.get("is_school_wide").isJsonNull() && record.get("is_school_wide").getAsBoolean();
                return isSchoolWide ? 0xFFD1FAE5 : 0xFFF3F4F6; // green : gray
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                boolean isSchoolWide = record.has("is_school_wide") && !record.get("is_school_wide").isJsonNull() && record.get("is_school_wide").getAsBoolean();
                return isSchoolWide ? 0xFF065F46 : 0xFF4B5563;
            }
            @Override
            public String getExtraData(JsonObject record) {
                String details = jsonStr(record, "details");
                if (details.length() > 50) return details.substring(0, 50) + "...";
                return details;
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("name", addTextField(container, "Name", null, jsonStr(existingData, "name"), true));
        formFields.put("date", addDateField(container, "Date", jsonStr(existingData, "date"), true));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), true));
        boolean isSchoolWide = existingData != null && existingData.has("is_school_wide") && !existingData.get("is_school_wide").isJsonNull() && existingData.get("is_school_wide").getAsBoolean();
        formFields.put("is_school_wide", addCheckBox(container, "Is School Wide", isSchoolWide));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("date", getTextValue(formFields.get("date")));
        data.addProperty("details", getTextValue(formFields.get("details")));
        data.addProperty("is_school_wide", ((CheckBox) formFields.get("is_school_wide")).isChecked());
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty() &&
               !getTextValue(formFields.get("details")).isEmpty();
    }
}
