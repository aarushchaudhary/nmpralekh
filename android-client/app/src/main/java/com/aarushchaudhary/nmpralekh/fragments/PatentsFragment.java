package com.aarushchaudhary.nmpralekh.fragments;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatentsFragment extends BaseRecordFragment {

    private List<JsonObject> pendingApplicants = new ArrayList<>();
    private LinearLayout coApplicantsContainer;

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
        formFields.put("doi_link", addTextField(container, "Patent Link", null, jsonStr(existingData, "doi_or_link"), true)); // Updated to Patent Link and doi_or_link

        // Co-applicants Section
        TextView coAppLabel = new TextView(requireContext());
        coAppLabel.setText("Co-applicants");
        coAppLabel.setTextSize(14);
        coAppLabel.setPadding(0, 16, 0, 8);
        container.addView(coAppLabel);

        coApplicantsContainer = new LinearLayout(requireContext());
        coApplicantsContainer.setOrientation(LinearLayout.VERTICAL);
        container.addView(coApplicantsContainer);

        Button addCoApplicantBtn = new Button(requireContext());
        addCoApplicantBtn.setText("+ Add Co-applicant");
        addCoApplicantBtn.setOnClickListener(v -> showAddCoApplicantDialog());
        container.addView(addCoApplicantBtn);

        pendingApplicants.clear();
        if (existingData != null && existingData.has("applicants")) {
            for (JsonElement el : existingData.getAsJsonArray("applicants")) {
                pendingApplicants.add(el.getAsJsonObject());
            }
        }
        renderCoApplicants();
    }

    private void showAddCoApplicantDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(requireContext());
        builder.setTitle("Add Co-applicant");

        LinearLayout layout = new LinearLayout(requireContext());
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 24, 48, 24);

        // Search or Manual Name
        TextView nameLabel = new TextView(requireContext());
        nameLabel.setText("Name (Search database or enter manually)");
        layout.addView(nameLabel);
        
        AutoCompleteTextView autoComplete = new AutoCompleteTextView(requireContext());
        autoComplete.setHint("Search faculty or type name...");
        autoComplete.setThreshold(2);
        FacultyAutoCompleteAdapter adapter = new FacultyAutoCompleteAdapter(requireContext());
        autoComplete.setAdapter(adapter);
        layout.addView(autoComplete);

        // Track selected user ID
        final int[] selectedUserId = {-1};
        autoComplete.setOnItemClickListener((parent, view, position, id) -> {
            JsonObject selectedUser = adapter.getItem(position);
            if (selectedUser != null) {
                autoComplete.setText(selectedUser.get("full_name").getAsString());
                selectedUserId[0] = selectedUser.get("id").getAsInt();
            }
        });
        
        // Reset user ID if they change the text after selection
        autoComplete.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                selectedUserId[0] = -1;
            }
            @Override
            public void afterTextChanged(android.text.Editable s) {}
        });

        // Applicant Type
        TextView typeLabel = new TextView(requireContext());
        typeLabel.setText("Applicant Type");
        typeLabel.setPadding(0, 24, 0, 0);
        layout.addView(typeLabel);
        
        Spinner typeSpinner = new Spinner(requireContext());
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(requireContext(),
                android.R.layout.simple_spinner_dropdown_item, Arrays.asList("Faculty/Admin", "Student"));
        typeSpinner.setAdapter(typeAdapter);
        layout.addView(typeSpinner);

        builder.setView(layout);

        builder.setPositiveButton("Add", (dialog, which) -> {
            String name = autoComplete.getText().toString().trim();
            if (name.isEmpty()) {
                Toast.makeText(requireContext(), "Name cannot be empty", Toast.LENGTH_SHORT).show();
                return;
            }
            
            String selectedTypeStr = typeSpinner.getSelectedItem().toString();
            String applicantType = selectedTypeStr.equals("Student") ? "student" : "faculty";

            JsonObject newApplicant = new JsonObject();
            newApplicant.addProperty("name", name);
            newApplicant.addProperty("applicant_type", applicantType);
            
            if (selectedUserId[0] != -1) {
                newApplicant.addProperty("user", selectedUserId[0]);
            } else {
                newApplicant.add("user", com.google.gson.JsonNull.INSTANCE);
            }
            
            pendingApplicants.add(newApplicant);
            renderCoApplicants();
        });
        
        builder.setNegativeButton("Cancel", null);

        builder.show();
    }

    private void renderCoApplicants() {
        if (coApplicantsContainer == null) return;
        coApplicantsContainer.removeAllViews();
        for (int i = 0; i < pendingApplicants.size(); i++) {
            JsonObject applicant = pendingApplicants.get(i);
            TextView tv = new TextView(requireContext());
            tv.setText("• " + jsonStr(applicant, "name") + (applicant.has("applicant_type") ? " (" + jsonStr(applicant, "applicant_type") + ")" : ""));
            tv.setPadding(0, 4, 0, 4);
            tv.setTextSize(14);
            coApplicantsContainer.addView(tv);
        }
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
        data.addProperty("doi_or_link", getTextValue(formFields.get("doi_link")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("applicant_name")).isEmpty() &&
               !getTextValue(formFields.get("title_of_patent")).isEmpty() &&
               !getTextValue(formFields.get("date_of_publication")).isEmpty() &&
               !getTextValue(formFields.get("journal_number")).isEmpty() &&
               !getTextValue(formFields.get("doi_link")).isEmpty();
    }

    @Override
    protected void createRecord(JsonObject data) {
        apiService.createPatent(data).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null) {
                    int patentId = response.body().get("id").getAsInt();
                    saveApplicants(patentId, () -> {
                        Toast.makeText(requireContext(), "Patent created successfully", Toast.LENGTH_SHORT).show();
                        currentPage = 1;
                        loadData();
                    });
                } else {
                    Toast.makeText(requireContext(), "Failed to create record", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void updateRecord(JsonObject original, JsonObject updated) {
        int id = original.get("id").getAsInt();
        apiService.updatePatent(id, updated).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    saveApplicants(id, () -> {
                        Toast.makeText(requireContext(), "Patent updated", Toast.LENGTH_SHORT).show();
                        loadData();
                    });
                } else {
                    Toast.makeText(requireContext(), "Failed to update record", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void saveApplicants(int patentId, Runnable onComplete) {
        List<JsonObject> applicantsToAdd = new ArrayList<>();
        for (JsonObject applicant : pendingApplicants) {
            if (!applicant.has("id")) { // Only add new ones
                applicantsToAdd.add(applicant);
            }
        }
        if (applicantsToAdd.isEmpty()) {
            onComplete.run();
            return;
        }
        saveApplicantRecursive(patentId, applicantsToAdd, 0, onComplete);
    }
    
    private void saveApplicantRecursive(int patentId, List<JsonObject> applicantsToAdd, int index, Runnable onComplete) {
        if (index >= applicantsToAdd.size()) {
            if (isAdded() && getActivity() != null) {
                getActivity().runOnUiThread(onComplete);
            }
            return;
        }
        apiService.addPatentApplicant(patentId, applicantsToAdd.get(index)).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                saveApplicantRecursive(patentId, applicantsToAdd, index + 1, onComplete);
            }
            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                // Continue even if one fails
                saveApplicantRecursive(patentId, applicantsToAdd, index + 1, onComplete);
            }
        });
    }

    private class FacultyAutoCompleteAdapter extends ArrayAdapter<JsonObject> implements Filterable {
        private List<JsonObject> resultList = new ArrayList<>();
        
        public FacultyAutoCompleteAdapter(Context context) {
            super(context, android.R.layout.simple_dropdown_item_1line);
        }

        @Override
        public int getCount() {
            return resultList.size();
        }

        @Override
        public JsonObject getItem(int position) {
            return resultList.get(position);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            TextView view = (TextView) super.getView(position, convertView, parent);
            JsonObject user = getItem(position);
            if (user != null) {
                view.setText(user.get("full_name").getAsString() + " (" + user.get("username").getAsString() + ")");
            }
            return view;
        }

        @Override
        public Filter getFilter() {
            return new Filter() {
                @Override
                protected FilterResults performFiltering(CharSequence constraint) {
                    FilterResults filterResults = new FilterResults();
                    if (constraint != null && constraint.length() >= 2) {
                        try {
                            Response<JsonArray> response = apiService.searchFaculty(constraint.toString()).execute();
                            if (response.isSuccessful() && response.body() != null) {
                                List<JsonObject> list = new ArrayList<>();
                                for (JsonElement el : response.body()) {
                                    list.add(el.getAsJsonObject());
                                }
                                filterResults.values = list;
                                filterResults.count = list.size();
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    return filterResults;
                }

                @Override
                protected void publishResults(CharSequence constraint, FilterResults results) {
                    if (results != null && results.count > 0) {
                        resultList = (List<JsonObject>) results.values;
                        notifyDataSetChanged();
                    } else {
                        notifyDataSetInvalidated();
                    }
                }
            };
        }
    }
}
