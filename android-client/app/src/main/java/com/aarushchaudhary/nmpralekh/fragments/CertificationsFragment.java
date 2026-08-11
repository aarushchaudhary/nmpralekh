package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.gson.JsonObject;
import java.util.Arrays;

public class CertificationsFragment extends BaseRecordFragment {

    public static CertificationsFragment newInstance() {
        return new CertificationsFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/certifications/";
    }

    @Override
    protected String getPageTitle() {
        return "Certifications";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage certification records";
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return jsonStr(record, "title_of_course");
            }
            @Override
            public String getSubtitle(JsonObject record) {
                return jsonStr(record, "name") + " · " + jsonStr(record, "agency");
            }
            @Override
            public String getBadgeText(JsonObject record) {
                return jsonStr(record, "person_type");
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                return 0xFFD1FAE5; // green
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0xFF065F46;
            }
            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "date");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        String defaultName = existingData != null ? jsonStr(existingData, "name") : new SessionManager(requireContext()).getFullName();
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("name", addTextField(container, "Name", null, defaultName, true));
        formFields.put("person_type", addSpinner(container, "Person Type", Arrays.asList("faculty", "student"), jsonStr(existingData, "person_type")));
        formFields.put("date", addDateField(container, "Date", jsonStr(existingData, "date"), true));
        formFields.put("title_of_course", addTextField(container, "Title of Course", null, jsonStr(existingData, "title_of_course"), true));
        formFields.put("agency", addTextField(container, "Agency", null, jsonStr(existingData, "agency"), true));
        formFields.put("credly_proof_link", addTextField(container, "Credly/Proof Link", null, jsonStr(existingData, "credly_proof_link"), true));
        formFields.put("details", addTextArea(container, "Details", jsonStr(existingData, "details"), false));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("person_type", ((Spinner) formFields.get("person_type")).getSelectedItem().toString());
        data.addProperty("date", getTextValue(formFields.get("date")));
        data.addProperty("title_of_course", getTextValue(formFields.get("title_of_course")));
        data.addProperty("agency", getTextValue(formFields.get("agency")));
        data.addProperty("credly_proof_link", getTextValue(formFields.get("credly_proof_link")));
        data.addProperty("details", getTextValue(formFields.get("details")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty() &&
               !getTextValue(formFields.get("title_of_course")).isEmpty() &&
               !getTextValue(formFields.get("agency")).isEmpty() &&
               !getTextValue(formFields.get("credly_proof_link")).isEmpty();
    }
}
