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

public class PublicationsFragment extends BaseRecordFragment {

    private List<JsonObject> pendingAuthors = new ArrayList<>();
    private LinearLayout coAuthorsContainer;

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
        formFields.put("doi_link", addTextField(container, "DOI/Link", null, jsonStr(existingData, "doi_link"), true));

        // Co-authors Section
        TextView coAuthLabel = new TextView(requireContext());
        coAuthLabel.setText("Co-authors");
        coAuthLabel.setTextSize(14);
        coAuthLabel.setPadding(0, 16, 0, 8);
        container.addView(coAuthLabel);

        coAuthorsContainer = new LinearLayout(requireContext());
        coAuthorsContainer.setOrientation(LinearLayout.VERTICAL);
        container.addView(coAuthorsContainer);

        Button addCoAuthorBtn = new Button(requireContext());
        addCoAuthorBtn.setText("+ Add Co-author");
        addCoAuthorBtn.setOnClickListener(v -> showAddCoAuthorDialog());
        container.addView(addCoAuthorBtn);

        pendingAuthors.clear();
        if (existingData != null && existingData.has("authors")) {
            for (JsonElement el : existingData.getAsJsonArray("authors")) {
                pendingAuthors.add(el.getAsJsonObject());
            }
        }
        renderCoAuthors();
    }

    private void showAddCoAuthorDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(requireContext());
        builder.setTitle("Add Co-author");

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

        // Author Type
        TextView typeLabel = new TextView(requireContext());
        typeLabel.setText("Author Type");
        typeLabel.setPadding(0, 24, 0, 0);
        layout.addView(typeLabel);
        
        Spinner typeSpinner = new Spinner(requireContext());
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(requireContext(),
                android.R.layout.simple_spinner_dropdown_item, Arrays.asList("Faculty/Admin", "Student"));
        typeSpinner.setAdapter(typeAdapter);
        layout.addView(typeSpinner);

        // Position / Order
        TextView orderLabel = new TextView(requireContext());
        orderLabel.setText("Position in Paper (e.g., 2, 3)");
        orderLabel.setPadding(0, 24, 0, 0);
        layout.addView(orderLabel);
        
        android.widget.EditText orderInput = new android.widget.EditText(requireContext());
        orderInput.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        orderInput.setHint("Position (1 to n)");
        layout.addView(orderInput);

        builder.setView(layout);

        builder.setPositiveButton("Add", (dialog, which) -> {
            String name = autoComplete.getText().toString().trim();
            if (name.isEmpty()) {
                Toast.makeText(requireContext(), "Name cannot be empty", Toast.LENGTH_SHORT).show();
                return;
            }
            
            String posStr = orderInput.getText().toString().trim();
            int order = 1;
            if (!posStr.isEmpty()) {
                try {
                    order = Integer.parseInt(posStr);
                } catch (NumberFormatException ignored) {}
            }
            
            String selectedTypeStr = typeSpinner.getSelectedItem().toString();
            String authorType = selectedTypeStr.equals("Student") ? "student" : "faculty";

            JsonObject newAuthor = new JsonObject();
            newAuthor.addProperty("name", name);
            newAuthor.addProperty("author_type", authorType);
            newAuthor.addProperty("order", order);
            
            if (selectedUserId[0] != -1) {
                newAuthor.addProperty("user", selectedUserId[0]);
            } else {
                newAuthor.add("user", com.google.gson.JsonNull.INSTANCE);
            }
            
            pendingAuthors.add(newAuthor);
            renderCoAuthors();
        });
        
        builder.setNegativeButton("Cancel", null);

        builder.show();
    }

    private void renderCoAuthors() {
        if (coAuthorsContainer == null) return;
        coAuthorsContainer.removeAllViews();
        for (int i = 0; i < pendingAuthors.size(); i++) {
            JsonObject author = pendingAuthors.get(i);
            TextView tv = new TextView(requireContext());
            String posText = author.has("order") ? "[Pos: " + author.get("order").getAsInt() + "] " : "";
            tv.setText(posText + "• " + jsonStr(author, "name") + (author.has("author_type") ? " (" + jsonStr(author, "author_type") + ")" : ""));
            tv.setPadding(0, 4, 0, 4);
            tv.setTextSize(14);
            coAuthorsContainer.addView(tv);
        }
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
        data.addProperty("doi_or_link", getTextValue(formFields.get("doi_link")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("author_name")).isEmpty() &&
               !getTextValue(formFields.get("title_of_paper")).isEmpty() &&
               !getTextValue(formFields.get("journal_or_conference_name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty() &&
               !getTextValue(formFields.get("doi_link")).isEmpty();
    }

    @Override
    protected void createRecord(JsonObject data) {
        apiService.createPublication(data).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null) {
                    int pubId = response.body().get("id").getAsInt();
                    saveAuthors(pubId, () -> {
                        Toast.makeText(requireContext(), "Publication created successfully", Toast.LENGTH_SHORT).show();
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
        apiService.updatePublication(id, updated).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    saveAuthors(id, () -> {
                        Toast.makeText(requireContext(), "Publication updated", Toast.LENGTH_SHORT).show();
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

    private void saveAuthors(int pubId, Runnable onComplete) {
        List<JsonObject> authorsToAdd = new ArrayList<>();
        for (JsonObject author : pendingAuthors) {
            if (!author.has("id")) { // Only add new ones
                authorsToAdd.add(author);
            }
        }
        if (authorsToAdd.isEmpty()) {
            onComplete.run();
            return;
        }
        saveAuthorRecursive(pubId, authorsToAdd, 0, onComplete);
    }
    
    private void saveAuthorRecursive(int pubId, List<JsonObject> authorsToAdd, int index, Runnable onComplete) {
        if (index >= authorsToAdd.size()) {
            if (isAdded() && getActivity() != null) {
                getActivity().runOnUiThread(onComplete);
            }
            return;
        }
        apiService.addPublicationAuthor(pubId, authorsToAdd.get(index)).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                saveAuthorRecursive(pubId, authorsToAdd, index + 1, onComplete);
            }
            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                // Continue even if one fails
                saveAuthorRecursive(pubId, authorsToAdd, index + 1, onComplete);
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
