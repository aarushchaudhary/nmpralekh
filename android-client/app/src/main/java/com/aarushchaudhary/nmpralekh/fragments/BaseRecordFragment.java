package com.aarushchaudhary.nmpralekh.fragments;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.aarushchaudhary.nmpralekh.ApiClient;
import com.aarushchaudhary.nmpralekh.R;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public abstract class BaseRecordFragment extends Fragment {

    protected ApiService apiService;
    protected RecordAdapter adapter;
    protected RecyclerView recyclerView;
    protected ProgressBar progressBar;
    protected LinearLayout layoutEmpty;
    protected LinearLayout layoutPagination;
    protected TextView tvPageInfo;
    protected MaterialButton btnPrevious, btnNext;
    protected TextView tvPageTitle, tvPageSubtitle;

    protected int currentPage = 1;
    protected int totalPages = 1;

    // Form field references - subclasses populate these
    protected Map<String, View> formFields = new HashMap<>();

    // School options loaded from API
    protected List<JsonObject> schools = new ArrayList<>();
    protected List<String> schoolNames = new ArrayList<>();
    protected List<Integer> schoolIds = new ArrayList<>();

    // Abstract methods
    protected abstract String getEndpoint();
    protected abstract String getPageTitle();
    protected abstract String getPageSubtitle();
    protected abstract RecordAdapter.RecordBinder getBinder();
    protected abstract void buildForm(LinearLayout container, JsonObject existingData);
    protected abstract JsonObject collectFormData();
    protected abstract boolean validateForm();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_record_list, container, false);
    }

    protected boolean isReadOnly() {
        return false;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        apiService = ApiClient.getApiService(requireContext());

        // Bind views
        tvPageTitle = view.findViewById(R.id.tvPageTitle);
        tvPageSubtitle = view.findViewById(R.id.tvPageSubtitle);
        recyclerView = view.findViewById(R.id.recyclerView);
        progressBar = view.findViewById(R.id.progressBar);
        layoutEmpty = view.findViewById(R.id.layoutEmpty);
        layoutPagination = view.findViewById(R.id.layoutPagination);
        tvPageInfo = view.findViewById(R.id.tvPageInfo);
        btnPrevious = view.findViewById(R.id.btnPrevious);
        btnNext = view.findViewById(R.id.btnNext);
        FloatingActionButton fabAdd = view.findViewById(R.id.fabAdd);

        if (isReadOnly()) {
            fabAdd.setVisibility(View.GONE);
        } else {
            fabAdd.setOnClickListener(v -> showFormDialog(null));
        }

        tvPageTitle.setText(getPageTitle());
        tvPageSubtitle.setText(getPageSubtitle());

        // Setup RecyclerView
        adapter = new RecordAdapter(getBinder(), new RecordAdapter.OnRecordActionListener() {
            @Override
            public void onEdit(JsonObject record) {
                if (!isReadOnly()) showFormDialog(record);
            }

            @Override
            public void onDelete(JsonObject record) {
                if (!isReadOnly()) showDeleteConfirmDialog(record);
            }
        });
        adapter.setReadOnly(isReadOnly());
        recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        recyclerView.setAdapter(adapter);

        // Pagination
        btnPrevious.setOnClickListener(v -> {
            if (currentPage > 1) {
                currentPage--;
                loadData();
            }
        });
        btnNext.setOnClickListener(v -> {
            if (currentPage < totalPages) {
                currentPage++;
                loadData();
            }
        });

        // Load schools first, then data
        loadSchools();
    }

    protected void loadSchools() {
        apiService.getMySchools().enqueue(new Callback<List<JsonObject>>() {
            @Override
            public void onResponse(Call<List<JsonObject>> call, Response<List<JsonObject>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    schools = response.body();
                    schoolNames.clear();
                    schoolIds.clear();
                    for (JsonObject school : schools) {
                        schoolNames.add(school.get("name").getAsString());
                        schoolIds.add(school.get("id").getAsInt());
                    }
                }
                loadData();
            }

            @Override
            public void onFailure(Call<List<JsonObject>> call, Throwable t) {
                loadData();
            }
        });
    }

    protected void loadData() {
        showLoading();

        Map<String, String> params = new HashMap<>();
        params.put("page", String.valueOf(currentPage));
        params.put("page_size", "25");

        // Use the right API call based on endpoint
        Call<JsonObject> call = getApiCall(params);
        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null) {
                    JsonObject body = response.body();
                    List<JsonObject> records = new ArrayList<>();

                    if (body.has("results")) {
                        JsonArray results = body.getAsJsonArray("results");
                        for (JsonElement el : results) {
                            records.add(el.getAsJsonObject());
                        }
                        totalPages = body.has("total_pages") ? body.get("total_pages").getAsInt() : 1;
                    } else {
                        // Non-paginated response
                        totalPages = 1;
                    }

                    adapter.setRecords(records);
                    showContent(records.isEmpty());
                    updatePagination();
                } else {
                    showEmpty();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                if (!isAdded()) return;
                showEmpty();
                Toast.makeText(requireContext(), "Failed to load data: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    protected Call<JsonObject> getApiCall(Map<String, String> params) {
        String endpoint = getEndpoint();
        if (endpoint.contains("school-activities")) return apiService.getSchoolActivities(params);
        if (endpoint.contains("student-activities")) return apiService.getStudentActivities(params);
        if (endpoint.contains("fdp")) return apiService.getFdp(params);
        if (endpoint.contains("placements")) return apiService.getPlacements(params);
        if (endpoint.contains("publications")) return apiService.getPublications(params);
        if (endpoint.contains("patents")) return apiService.getPatents(params);
        if (endpoint.contains("certifications")) return apiService.getCertifications(params);
        if (endpoint.contains("clubs")) return apiService.getClubs(params);
        if (endpoint.contains("school-faculties")) return apiService.getSchoolFaculties(params);
        if (endpoint.contains("reports/received")) return apiService.getReceivedReports(params);
        return apiService.getSchoolActivities(params); // fallback
    }

    protected void showFormDialog(JsonObject existingData) {
        boolean isEdit = existingData != null;
        formFields.clear();

        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle(isEdit ? "Edit Record" : "Add Record");

        // Inflate form layout
        View formView = getLayoutInflater().inflate(R.layout.dialog_record_form, null);
        LinearLayout container = formView.findViewById(R.id.formContainer);
        buildForm(container, existingData);
        builder.setView(formView);

        if (isEdit) {
            builder.setPositiveButton("Submit for Approval", null); // set below
        } else {
            builder.setPositiveButton("Save Record", null);
        }
        builder.setNegativeButton("Cancel", (d, w) -> d.dismiss());

        AlertDialog dialog = builder.create();
        dialog.show();

        // Override positive button to prevent auto-dismiss on validation failure
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            if (!validateForm()) {
                Toast.makeText(requireContext(), "Please fill all required fields", Toast.LENGTH_SHORT).show();
                return;
            }

            JsonObject data = collectFormData();
            if (isEdit) {
                // Show confirm dialog first
                dialog.dismiss();
                showEditConfirmDialog(existingData, data);
            } else {
                dialog.dismiss();
                createRecord(data);
            }
        });
    }

    protected void showEditConfirmDialog(JsonObject original, JsonObject updated) {
        new AlertDialog.Builder(requireContext())
                .setTitle("Submit Update Request")
                .setMessage("This update will be sent for approval before being applied. Continue?")
                .setPositiveButton("Submit for Approval", (d, w) -> updateRecord(original, updated))
                .setNegativeButton("Cancel", null)
                .show();
    }

    protected void showDeleteConfirmDialog(JsonObject record) {
        new AlertDialog.Builder(requireContext())
                .setTitle("Submit Delete Request")
                .setMessage("This delete request will be sent for approval before the record is removed.")
                .setPositiveButton("Submit for Approval", (d, w) -> deleteRecord(record))
                .setNegativeButton("Cancel", null)
                .show();
    }

    protected void createRecord(JsonObject data) {
        String endpoint = getEndpoint();
        Call<JsonObject> call;
        if (endpoint.contains("school-activities")) call = apiService.createSchoolActivity(data);
        else if (endpoint.contains("student-activities")) call = apiService.createStudentActivity(data);
        else if (endpoint.contains("fdp")) call = apiService.createFdp(data);
        else if (endpoint.contains("placements")) call = apiService.createPlacement(data);
        else if (endpoint.contains("publications")) call = apiService.createPublication(data);
        else if (endpoint.contains("patents")) call = apiService.createPatent(data);
        else if (endpoint.contains("certifications")) call = apiService.createCertification(data);
        else return;

        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Record created successfully", Toast.LENGTH_SHORT).show();
                    currentPage = 1;
                    loadData();
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

    protected void updateRecord(JsonObject original, JsonObject updated) {
        int id = original.get("id").getAsInt();
        String endpoint = getEndpoint();
        Call<JsonObject> call;
        if (endpoint.contains("school-activities")) call = apiService.updateSchoolActivity(id, updated);
        else if (endpoint.contains("student-activities")) call = apiService.updateStudentActivity(id, updated);
        else if (endpoint.contains("fdp")) call = apiService.updateFdp(id, updated);
        else if (endpoint.contains("placements")) call = apiService.updatePlacement(id, updated);
        else if (endpoint.contains("publications")) call = apiService.updatePublication(id, updated);
        else if (endpoint.contains("patents")) call = apiService.updatePatent(id, updated);
        else if (endpoint.contains("certifications")) call = apiService.updateCertification(id, updated);
        else return;

        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() || response.code() == 202) {
                    Toast.makeText(requireContext(), "Update request submitted", Toast.LENGTH_SHORT).show();
                    loadData();
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

    protected void deleteRecord(JsonObject record) {
        int id = record.get("id").getAsInt();
        String endpoint = getEndpoint();
        Call<JsonObject> call;
        if (endpoint.contains("school-activities")) call = apiService.deleteSchoolActivity(id);
        else if (endpoint.contains("student-activities")) call = apiService.deleteStudentActivity(id);
        else if (endpoint.contains("fdp")) call = apiService.deleteFdp(id);
        else if (endpoint.contains("placements")) call = apiService.deletePlacement(id);
        else if (endpoint.contains("publications")) call = apiService.deletePublication(id);
        else if (endpoint.contains("patents")) call = apiService.deletePatent(id);
        else if (endpoint.contains("certifications")) call = apiService.deleteCertification(id);
        else return;

        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() || response.code() == 202) {
                    Toast.makeText(requireContext(), "Delete request submitted", Toast.LENGTH_SHORT).show();
                    loadData();
                } else {
                    Toast.makeText(requireContext(), "Failed to delete record", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // Helper methods for building forms
    protected TextInputEditText addTextField(LinearLayout container, String label, String hint, String value, boolean required) {
        TextInputLayout layout = new TextInputLayout(requireContext(), null, com.google.android.material.R.attr.textInputOutlinedStyle);
        layout.setHint(label + (required ? " *" : ""));
        layout.setBoxBackgroundMode(TextInputLayout.BOX_BACKGROUND_OUTLINE);
        layout.setBoxCornerRadii(8, 8, 8, 8);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 0, 16);
        layout.setLayoutParams(params);

        TextInputEditText editText = new TextInputEditText(requireContext());
        editText.setHint(hint != null ? hint : "");
        if (value != null) editText.setText(value);
        editText.setTextSize(14);
        layout.addView(editText);

        container.addView(layout);
        return editText;
    }

    protected TextInputEditText addDateField(LinearLayout container, String label, String value, boolean required) {
        TextInputEditText field = addTextField(container, label, "YYYY-MM-DD", value, required);
        field.setInputType(android.text.InputType.TYPE_CLASS_DATETIME);
        // Show date picker on click
        field.setFocusable(false);
        field.setOnClickListener(v -> {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            // Try to parse existing value
            if (value != null && !value.isEmpty()) {
                try {
                    String[] parts = value.split("-");
                    cal.set(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]) - 1, Integer.parseInt(parts[2]));
                } catch (Exception ignored) {}
            }
            new android.app.DatePickerDialog(requireContext(), (view, year, month, dayOfMonth) -> {
                String date = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth);
                field.setText(date);
            }, cal.get(java.util.Calendar.YEAR), cal.get(java.util.Calendar.MONTH), cal.get(java.util.Calendar.DAY_OF_MONTH)).show();
        });
        return field;
    }

    protected TextInputEditText addTextArea(LinearLayout container, String label, String value, boolean required) {
        TextInputEditText field = addTextField(container, label, null, value, required);
        field.setMinLines(3);
        field.setMaxLines(5);
        field.setGravity(android.view.Gravity.TOP);
        return field;
    }

    protected Spinner addSpinner(LinearLayout container, String label, List<String> options, String selectedValue) {
        TextView labelView = new TextView(requireContext());
        labelView.setText(label);
        labelView.setTextSize(13);
        labelView.setTextColor(0xFF374151);
        LinearLayout.LayoutParams lblParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lblParams.setMargins(4, 0, 0, 4);
        labelView.setLayoutParams(lblParams);
        container.addView(labelView);

        Spinner spinner = new Spinner(requireContext());
        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(requireContext(),
                android.R.layout.simple_spinner_dropdown_item, options);
        spinner.setAdapter(spinnerAdapter);

        if (selectedValue != null) {
            int pos = options.indexOf(selectedValue);
            if (pos >= 0) spinner.setSelection(pos);
        }

        LinearLayout.LayoutParams spParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        spParams.setMargins(0, 0, 0, 16);
        spinner.setLayoutParams(spParams);
        container.addView(spinner);

        return spinner;
    }

    protected CheckBox addCheckBox(LinearLayout container, String label, boolean isChecked) {
        CheckBox cb = new CheckBox(requireContext());
        cb.setText(label);
        cb.setChecked(isChecked);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 0, 16);
        cb.setLayoutParams(params);
        container.addView(cb);
        return cb;
    }

    protected Spinner addSchoolSpinner(LinearLayout container, String selectedSchoolName) {
        List<String> names = new ArrayList<>();
        names.add("Select School...");
        names.addAll(schoolNames);
        return addSpinner(container, "School *", names, selectedSchoolName);
    }

    protected int getSelectedSchoolId(Spinner schoolSpinner) {
        int pos = schoolSpinner.getSelectedItemPosition();
        if (pos <= 0 || pos > schoolIds.size()) return -1;
        return schoolIds.get(pos - 1); // offset by 1 because of "Select School..." placeholder
    }

    protected String getTextValue(View field) {
        if (field instanceof TextInputEditText) {
            return ((TextInputEditText) field).getText().toString().trim();
        }
        if (field instanceof EditText) {
            return ((EditText) field).getText().toString().trim();
        }
        return "";
    }

    // UI state helpers
    protected void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
        layoutEmpty.setVisibility(View.GONE);
    }

    protected void showContent(boolean isEmpty) {
        progressBar.setVisibility(View.GONE);
        if (isEmpty) {
            recyclerView.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            layoutEmpty.setVisibility(View.GONE);
        }
    }

    protected void showEmpty() {
        progressBar.setVisibility(View.GONE);
        recyclerView.setVisibility(View.GONE);
        layoutEmpty.setVisibility(View.VISIBLE);
    }

    protected void updatePagination() {
        if (totalPages > 1) {
            layoutPagination.setVisibility(View.VISIBLE);
            tvPageInfo.setText("Page " + currentPage + " of " + totalPages);
            btnPrevious.setEnabled(currentPage > 1);
            btnNext.setEnabled(currentPage < totalPages);
        } else {
            layoutPagination.setVisibility(View.GONE);
        }
    }

    // Helper to safely get string from JsonObject
    protected String jsonStr(JsonObject obj, String key) {
        if (obj != null && obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return "";
    }

    protected int jsonInt(JsonObject obj, String key) {
        if (obj != null && obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsInt();
        }
        return 0;
    }
}
