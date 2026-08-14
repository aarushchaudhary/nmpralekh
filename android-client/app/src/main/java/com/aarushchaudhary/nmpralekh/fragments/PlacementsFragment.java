package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class PlacementsFragment extends BaseRecordFragment {

    public static PlacementsFragment newInstance() {
        return new PlacementsFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/placements/";
    }

    @Override
    protected String getPageTitle() {
        return "Placements";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage placement records";
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
                return null;
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                return 0;
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0;
            }
            @Override
            public String getExtraData(JsonObject record) {
                String co = jsonStr(record, "company_name");
                if (co.isEmpty()) return jsonStr(record, "placecom_name");
                return co;
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("name", addTextField(container, "Activity Name", null, jsonStr(existingData, "name"), true));
        formFields.put("date", addDateField(container, "Date", jsonStr(existingData, "date"), true));
        formFields.put("placecom_name", addTextField(container, "PlaceCom", null, jsonStr(existingData, "placecom_name"), false));
        formFields.put("company_name", addTextField(container, "Company Name", null, jsonStr(existingData, "company_name"), false));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), true));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("date", getTextValue(formFields.get("date")));
        data.addProperty("placecom_name", getTextValue(formFields.get("placecom_name")));
        data.addProperty("company_name", getTextValue(formFields.get("company_name")));
        data.addProperty("details", getTextValue(formFields.get("details")));
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
