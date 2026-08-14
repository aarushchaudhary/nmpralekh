package com.aarushchaudhary.nmpralekh.fragments;

import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.Toast;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentActivitiesFragment extends BaseRecordFragment {

    private List<JsonObject> currentClubs = new ArrayList<>();
    private LinearLayout dynamicContainer;

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
        
        Spinner typeSpinner = addSpinner(container, "Activity Type", Arrays.asList("Club", "Committee", "Other"), jsonStr(existingData, "activity_type"));
        formFields.put("activity_type", typeSpinner);

        dynamicContainer = new LinearLayout(requireContext());
        dynamicContainer.setOrientation(LinearLayout.VERTICAL);
        container.addView(dynamicContainer);

        LinearLayout detailsContainer = new LinearLayout(requireContext());
        detailsContainer.setOrientation(LinearLayout.VERTICAL);
        container.addView(detailsContainer);
        formFields.put("details", addTextArea(detailsContainer, "Details", jsonStr(existingData, "details"), true));

        typeSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selectedType = parent.getItemAtPosition(position).toString();
                updateDynamicFields(selectedType, existingData);
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void updateDynamicFields(String type, JsonObject existingData) {
        dynamicContainer.removeAllViews();
        formFields.remove("conducted_by");
        formFields.remove("club_spinner");

        if (type.equals("Other")) {
            formFields.put("conducted_by", addTextField(dynamicContainer, "Conducted By", null, jsonStr(existingData, "conducted_by"), true));
        } else {
            Spinner clubSpinner = addSpinner(dynamicContainer, "Select " + type, new ArrayList<>(), null);
            formFields.put("club_spinner", clubSpinner);
            
            Map<String, String> params = new HashMap<>();
            params.put("type", type.toLowerCase());
            params.put("is_active", "true");
            params.put("page_size", "100");

            Spinner schoolSpinner = (Spinner) formFields.get("school");
            int schoolId = getSelectedSchoolId(schoolSpinner);
            if (schoolId != -1) {
                params.put("school", String.valueOf(schoolId));
            }

            apiService.getClubs(params).enqueue(new Callback<JsonObject>() {
                @Override
                public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                    if (!isAdded()) return;
                    if (response.isSuccessful() && response.body() != null) {
                        currentClubs.clear();
                        List<String> names = new ArrayList<>();
                        if (response.body().has("results")) {
                            JsonArray results = response.body().getAsJsonArray("results");
                            for (JsonElement el : results) {
                                currentClubs.add(el.getAsJsonObject());
                                names.add(jsonStr(el.getAsJsonObject(), "name"));
                            }
                        }
                        ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(),
                                android.R.layout.simple_spinner_dropdown_item, names);
                        clubSpinner.setAdapter(adapter);

                        if (existingData != null && existingData.has("club") && !existingData.get("club").isJsonNull()) {
                            int existingId = existingData.get("club").getAsInt();
                            for (int i = 0; i < currentClubs.size(); i++) {
                                if (currentClubs.get(i).get("id").getAsInt() == existingId) {
                                    clubSpinner.setSelection(i);
                                    break;
                                }
                            }
                        }
                    }
                }
                @Override
                public void onFailure(Call<JsonObject> call, Throwable t) {
                    if (!isAdded()) return;
                    Toast.makeText(requireContext(), "Failed to load " + type + "s", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("date", getTextValue(formFields.get("date")));
        
        String type = ((Spinner) formFields.get("activity_type")).getSelectedItem().toString();
        data.addProperty("activity_type", type.toLowerCase());
        
        if (type.equals("Other")) {
            data.addProperty("conducted_by", getTextValue(formFields.get("conducted_by")));
            data.add("club", com.google.gson.JsonNull.INSTANCE);
            data.addProperty("club_name", "");
        } else {
            Spinner clubSpinner = (Spinner) formFields.get("club_spinner");
            if (clubSpinner != null && clubSpinner.getSelectedItemPosition() >= 0 && clubSpinner.getSelectedItemPosition() < currentClubs.size()) {
                JsonObject selectedClub = currentClubs.get(clubSpinner.getSelectedItemPosition());
                data.addProperty("club", selectedClub.get("id").getAsInt());
                data.addProperty("club_name", jsonStr(selectedClub, "name"));
            }
            data.addProperty("conducted_by", "");
        }
        
        data.addProperty("details", getTextValue(formFields.get("details")));
        return data;
    }

    @Override
    protected boolean validateForm() {
        boolean valid = getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("name")).isEmpty() &&
               !getTextValue(formFields.get("date")).isEmpty() &&
               !getTextValue(formFields.get("details")).isEmpty();
               
        if (!valid) return false;
        
        String type = ((Spinner) formFields.get("activity_type")).getSelectedItem().toString();
        if (type.equals("Other")) {
            return !getTextValue(formFields.get("conducted_by")).isEmpty();
        } else {
            Spinner clubSpinner = (Spinner) formFields.get("club_spinner");
            return clubSpinner != null && clubSpinner.getSelectedItemPosition() >= 0 && !currentClubs.isEmpty();
        }
    }
}
