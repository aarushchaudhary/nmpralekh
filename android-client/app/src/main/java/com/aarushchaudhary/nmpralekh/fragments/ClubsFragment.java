package com.aarushchaudhary.nmpralekh.fragments;

import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.Toast;

import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

import java.util.Arrays;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ClubsFragment extends BaseRecordFragment {

    public static ClubsFragment newInstance() {
        return new ClubsFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/records/clubs/";
    }

    @Override
    protected String getPageTitle() {
        return "Clubs & Committees";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage school clubs and committees";
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
                return jsonStr(record, "type");
            }

            @Override
            public String getBadgeText(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? "Active" : "Inactive";
            }

            @Override
            public int getBadgeColor(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? 0xFFD1FAE5 : 0xFFF3F4F6;
            }

            @Override
            public int getBadgeTextColor(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? 0xFF065F46 : 0xFF374151;
            }

            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "school_name");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        formFields.put("school", addSchoolSpinner(container, jsonStr(existingData, "school_name")));
        formFields.put("name", addTextField(container, "Name", null, jsonStr(existingData, "name"), true));
        formFields.put("type", addSpinner(container, "Type", Arrays.asList("club", "committee", "placecom"), jsonStr(existingData, "type")));
        boolean isActive = true;
        if (existingData != null && existingData.has("is_active")) {
            isActive = existingData.get("is_active").getAsBoolean();
        }
        formFields.put("is_active", addCheckBox(container, "Active", isActive));
    }

    @Override
    protected JsonObject collectFormData() {
        JsonObject data = new JsonObject();
        data.addProperty("school", getSelectedSchoolId((Spinner) formFields.get("school")));
        data.addProperty("name", getTextValue(formFields.get("name")));
        data.addProperty("type", ((Spinner) formFields.get("type")).getSelectedItem().toString());
        data.addProperty("is_active", ((CheckBox) formFields.get("is_active")).isChecked());
        return data;
    }

    @Override
    protected boolean validateForm() {
        return getSelectedSchoolId((Spinner) formFields.get("school")) != -1 &&
               !getTextValue(formFields.get("name")).isEmpty();
    }

    @Override
    protected void createRecord(JsonObject data) {
        apiService.createClub(data).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Club created", Toast.LENGTH_SHORT).show();
                    currentPage = 1;
                    loadData();
                } else {
                    Toast.makeText(requireContext(), "Failed to create", Toast.LENGTH_SHORT).show();
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
        apiService.updateClub(id, updated).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Club updated", Toast.LENGTH_SHORT).show();
                    loadData();
                } else {
                    Toast.makeText(requireContext(), "Failed to update", Toast.LENGTH_SHORT).show();
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
    protected void deleteRecord(JsonObject record) {
        int id = record.get("id").getAsInt();
        apiService.deleteClub(id).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (!isAdded()) return;
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Club deleted", Toast.LENGTH_SHORT).show();
                    loadData();
                } else {
                    Toast.makeText(requireContext(), "Failed to delete", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
