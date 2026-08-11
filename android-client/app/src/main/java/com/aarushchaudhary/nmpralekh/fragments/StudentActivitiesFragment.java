package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;
import java.util.Arrays;

public class StudentActivitiesFragment extends BaseRecordFragment {

    public static StudentActivitiesFragment newInstance() {
        return new StudentActivitiesFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/student-activities/";
    }

    @Override
    protected String getPageTitle() {
        return "Student Activities";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage student activity records";
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
                return jsonStr(record, "activity_type");
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                return 0xFFDBEAFE; // blue
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0xFF1D4ED8;
            }
            @Override
            public String getExtraData(JsonObject record) {
                String club = jsonStr(record, "club_name");
                if (club.isEmpty()) return jsonStr(record, "conducted_by");
                return club;
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("name", addTextField(container, "Name", null, jsonStr(existingData, "name"), true));
        formFields.put("date", addDateField(container, "Date", jsonStr(existingData, "date"), true));
        formFields.put("activity_type", addSpinner(container, "Activity Type", Arrays.asList("Club", "Committee", "Other"), jsonStr(existingData, "activity_type")));
        formFields.put("club", addTextField(container, "Club/Committee", null, jsonStr(existingData, "club_name"), false));
        formFields.put("conducted_by", addTextField(container, "Conducted By", null, jsonStr(existingData, "conducted_by"), false));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), false));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("date", getTextValue(formFields.get("date")));
        data.addProperty("activity_type", ((Spinner) formFields.get("activity_type")).getSelectedItem().toString());
        data.addProperty("club_name", getTextValue(formFields.get("club")));
        data.addProperty("conducted_by", getTextValue(formFields.get("conducted_by")));
        data.addProperty("details", getTextValue(formFields.get("details")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty();
    }
}
