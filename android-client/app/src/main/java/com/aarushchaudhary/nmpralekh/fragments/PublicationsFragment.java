package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.LinearLayout;
import android.widget.Spinner;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.gson.JsonObject;
import java.util.Arrays;

public class PublicationsFragment extends BaseRecordFragment {

    public static PublicationsFragment newInstance() {
        return new PublicationsFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/publications/";
    }

    @Override
    protected String getPageTitle() {
        return "Publications";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage publication records";
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return jsonStr(record, "title_of_paper");
            }
            @Override
            public String getSubtitle(JsonObject record) {
                return jsonStr(record, "author_name") + " · " + jsonStr(record, "journal_or_conference_name");
            }
            @Override
            public String getBadgeText(JsonObject record) {
                return jsonStr(record, "author_type");
            }
            @Override
            public int getBadgeColor(JsonObject record) {
                return 0xFFFEF3C7; // yellow
            }
            @Override
            public int getBadgeTextColor(JsonObject record) {
                return 0xFF92400E;
            }
            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "date");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        String defaultName = existingData != null ? jsonStr(existingData, "author_name") : new SessionManager(requireContext()).getFullName();
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("author_name", addTextField(container, "Author Name", null, defaultName, true));
        formFields.put("author_type", addSpinner(container, "Author Type", Arrays.asList("faculty", "student"), jsonStr(existingData, "author_type")));
        formFields.put("title_of_paper", addTextField(container, "Title of Paper", null, jsonStr(existingData, "title_of_paper"), true));
        formFields.put("journal_or_conference_name", addTextField(container, "Journal/Conference Name", null, jsonStr(existingData, "journal_or_conference_name"), true));
        formFields.put("date", addDateField(container, "Date", jsonStr(existingData, "date"), true));
        formFields.put("venue", addTextField(container, "Venue", null, jsonStr(existingData, "venue"), false));
        formFields.put("publication", addTextField(container, "Publication", null, jsonStr(existingData, "publication"), false));
        formFields.put("doi_link", addTextField(container, "DOI/Link", null, jsonStr(existingData, "doi_link"), false));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("author_name", getTextValue(formFields.get("author_name")));
        data.addProperty("author_type", ((Spinner) formFields.get("author_type")).getSelectedItem().toString());
        data.addProperty("title_of_paper", getTextValue(formFields.get("title_of_paper")));
        data.addProperty("journal_or_conference_name", getTextValue(formFields.get("journal_or_conference_name")));
        data.addProperty("date", getTextValue(formFields.get("date")));
        data.addProperty("venue", getTextValue(formFields.get("venue")));
        data.addProperty("publication", getTextValue(formFields.get("publication")));
        data.addProperty("doi_link", getTextValue(formFields.get("doi_link")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("author_name")).isEmpty() &&
               !getTextValue(formFields.get("title_of_paper")).isEmpty() &&
               !getTextValue(formFields.get("journal_or_conference_name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty();
    }
}
