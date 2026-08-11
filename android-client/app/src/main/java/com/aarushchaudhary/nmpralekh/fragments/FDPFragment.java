package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;
import java.util.Arrays;

public class FDPFragment extends BaseRecordFragment {

    public static FDPFragment newInstance() {
        return new FDPFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/fdp/";
    }

    @Override
    protected String getPageTitle() {
        return "FDP / Workshops";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage FDP and workshop records";
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
                return jsonStr(record, "faculty_name") + " · " + jsonStr(record, "date_start");
            }
            @Override
            public String getBadgeText(JsonObject record) {
                return jsonStr(record, "type").replace("_", " ");
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                return 0xFFEDE9FE; // purple
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0xFF6D28D9;
            }
            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "organizing_body");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("faculty_name", addTextField(container, "Faculty Name", null, jsonStr(existingData, "faculty_name"), true));
        formFields.put("date_start", addDateField(container, "Date Start", jsonStr(existingData, "date_start"), true));
        formFields.put("date_end", addDateField(container, "Date End", jsonStr(existingData, "date_end"), false));
        formFields.put("name", addTextField(container, "Name/Title", null, jsonStr(existingData, "name"), true));
        formFields.put("type", addSpinner(container, "Type", Arrays.asList("FDP", "Workshop", "Guest_Lecture"), jsonStr(existingData, "type")));
        formFields.put("organizing_body", addTextField(container, "Organizing Body", null, jsonStr(existingData, "organizing_body"), false));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), false));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("faculty_name", getTextValue(formFields.get("faculty_name")));
        data.addProperty("date_start", getTextValue(formFields.get("date_start")));
        data.addProperty("date_end", getTextValue(formFields.get("date_end")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("type", ((Spinner) formFields.get("type")).getSelectedItem().toString());
        data.addProperty("organizing_body", getTextValue(formFields.get("organizing_body")));
        data.addProperty("details", getTextValue(formFields.get("details")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("faculty_name")).isEmpty() &&
               !getTextValue(formFields.get("name")).isEmpty() &&
               !getTextValue(formFields.get("date_start")).isEmpty();
    }
}
