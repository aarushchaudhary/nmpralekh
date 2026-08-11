package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.gson.JsonObject;
import java.util.Arrays;

public class PatentsFragment extends BaseRecordFragment {

    public static PatentsFragment newInstance() {
        return new PatentsFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/patents/";
    }

    @Override
    protected String getPageTitle() {
        return "Patents";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage patent records";
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return jsonStr(record, "title_of_patent");
            }
            @Override
            public String getSubtitle(JsonObject record) {
                return jsonStr(record, "applicant_name") + " · " + jsonStr(record, "date_of_publication");
            }
            @Override
            public String getBadgeText(JsonObject record) {
                return jsonStr(record, "patent_status");
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
                return jsonStr(record, "journal_number");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        String defaultName = existingData != null ? jsonStr(existingData, "applicant_name") : new SessionManager(requireContext()).getFullName();
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("applicant_name", addTextField(container, "Applicant Name", null, defaultName, true));
        formFields.put("applicant_type", addSpinner(container, "Applicant Type", Arrays.asList("faculty", "student"), jsonStr(existingData, "applicant_type")));
        formFields.put("title_of_patent", addTextField(container, "Title of Patent", null, jsonStr(existingData, "title_of_patent"), true));
        formFields.put("date_of_publication", addDateField(container, "Date of Publication", jsonStr(existingData, "date_of_publication"), true));
        formFields.put("journal_number", addTextField(container, "Journal Number", null, jsonStr(existingData, "journal_number"), true));
        formFields.put("patent_status", addSpinner(container, "Patent Status", Arrays.asList("filed", "published", "granted"), jsonStr(existingData, "patent_status")));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), false));
        formFields.put("doi_link", addTextField(container, "DOI/Link", null, jsonStr(existingData, "doi_link"), false));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("applicant_name", getTextValue(formFields.get("applicant_name")));
        data.addProperty("applicant_type", ((Spinner) formFields.get("applicant_type")).getSelectedItem().toString());
        data.addProperty("title_of_patent", getTextValue(formFields.get("title_of_patent")));
        data.addProperty("date_of_publication", getTextValue(formFields.get("date_of_publication")));
        data.addProperty("journal_number", getTextValue(formFields.get("journal_number")));
        data.addProperty("patent_status", ((Spinner) formFields.get("patent_status")).getSelectedItem().toString());
        data.addProperty("details", getTextValue(formFields.get("details")));
        data.addProperty("doi_link", getTextValue(formFields.get("doi_link")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("applicant_name")).isEmpty() &&
               !getTextValue(formFields.get("title_of_patent")).isEmpty() &&
               !getTextValue(formFields.get("date_of_publication")).isEmpty() &&
               !getTextValue(formFields.get("journal_number")).isEmpty();
    }
}
