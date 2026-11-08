package com.aarushchaudhary.nmpralekh.fragments;
import java.util.Map;
import retrofit2.Call;

import android.widget.LinearLayout;
import com.aarushchaudhary.nmpralekh.adapters.RecordAdapter;
import com.google.gson.JsonObject;

public class CampusUsersFragment extends BaseRecordFragment {

    public static CampusUsersFragment newInstance() {
        return new CampusUsersFragment();
    }

    @Override
    protected String getEndpoint() {
        return "/api/users/campus-users/";
    }

    @Override
    protected String getPageTitle() {
        return "Campus Users";
    }

    @Override
    protected String getPageSubtitle() {
        return "Manage all users across the campus";
    }

    @Override
    protected boolean isReadOnly() {
        // Based on the React app, super admin just views this list (or at least no add/edit/delete in CampusUsersPage.jsx)
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
                return jsonStr(record, "email") + " · " + jsonStr(record, "username");
            }

            @Override

            public RecordAdapter.BadgeStyle getBadgeStyle(JsonObject record) {

                return "super_admin".equals(jsonStr(record, "role")) ? RecordAdapter.BadgeStyle.DARK : RecordAdapter.BadgeStyle.GRAY;

            }

            @Override
            public String getBadgeText(JsonObject record) {
                String role = jsonStr(record, "role");
                if (role == null) return "Unknown";
                switch (role) {
                    case "admin": return "Admin";
                    case "user": return "Faculty";
                    case "super_admin": return "Super Admin";
                    case "delete_auth": return "Delete Auth";
                    default: return role;
                }
            }

            @Override
            public String getExtraData(JsonObject record) {
                return "School: " + jsonStr(record, "school_code");
            }
        };
    }

    @Override
    protected void buildForm(LinearLayout container, JsonObject existingData) {
        // Read only
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
        return apiService.getCampusUsers(params);
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
