package com.aarushchaudhary.nmpralekh.fragments;
import java.util.Map;
import retrofit2.Call;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class FacultiesFragment extends BaseRecordFragment {

    public static FacultiesFragment newInstance() {
        return new FacultiesFragment();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        adapter.setOnItemClick(this::showResetPasswordDialog);
    }

    @Override
    protected String getEndpoint() {
        return "/api/users/school-faculties/";
    }

    @Override
    protected String getPageTitle() {
        return "Faculties";
    }

    @Override
    protected String getPageSubtitle() {
        return "Faculty and MIS coordinators in your schools. Tap one to reset their password.";
    }

    @Override
    protected boolean isReadOnly() {
        return true;
    }

    @Override
    protected RecordAdapter.RecordBinder getBinder() {
        return new RecordAdapter.RecordBinder() {
            @Override
            public String getTitle(JsonObject record) {
                return jsonStr(record, "full_name");
            }

            @Override
            public String getSubtitle(JsonObject record) {
                String role = "mis_coordinator".equals(jsonStr(record, "role")) ? "MIS Coordinator" : "Faculty";
                return role + " · " + jsonStr(record, "email") + " · " + jsonStr(record, "username");
            }

            @Override

            public RecordAdapter.BadgeStyle getBadgeStyle(JsonObject record) {

                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? RecordAdapter.BadgeStyle.DARK : RecordAdapter.BadgeStyle.GRAY;

            }

            @Override
            public String getBadgeText(JsonObject record) {
                boolean isActive = record.has("is_active") && record.get("is_active").getAsBoolean();
                return isActive ? "Active" : "Inactive";
            }

            @Override
            public String getExtraData(JsonObject record) {
                return jsonStr(record, "school_code");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        // Read only, no form needed
    }

    @Override
    protected JsonObject collectFormData() {
        return new JsonObject();
    }

    @Override
    protected boolean validateForm() {
        return true;
    }

    @Override
    protected Call<JsonObject> getApiCall(Map<String, String> params) {
        return apiService.getSchoolFaculties(params);
    }

    @Override
    protected Call<JsonObject> createRecordCall(JsonObject data) {
        return null;
    }

    @Override
    protected Call<JsonObject> updateRecordCall(int id, JsonObject data) {
        return null;
    }

    @Override
    protected Call<JsonObject> deleteRecordCall(int id) {
        return null;
    }
}
