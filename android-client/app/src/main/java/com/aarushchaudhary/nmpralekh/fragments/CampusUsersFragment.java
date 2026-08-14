package com.aarushchaudhary.nmpralekh.fragments;

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
            public int getBadgeColor(JsonObject record) {
                String role = jsonStr(record, "role");
                if (role == null) return 0xFFF3F4F6;
                switch (role) {
                    case "admin": return 0xFFDBEAFE; // blue-50
                    case "user": return 0xFFF3E8FF; // purple-50
                    case "super_admin": return 0xFFD1FAE5; // green-50
                    case "delete_auth": return 0xFFFEF3C7; // yellow-50
                    default: return 0xFFF3F4F6; // gray-50
                }
            }

            @Override
            public int getBadgeTextColor(JsonObject record) {
                String role = jsonStr(record, "role");
                if (role == null) return 0xFF374151;
                switch (role) {
                    case "admin": return 0xFF1D4ED8; // blue-700
                    case "user": return 0xFF7E22CE; // purple-700
                    case "super_admin": return 0xFF047857; // green-700
                    case "delete_auth": return 0xFFB45309; // yellow-700
                    default: return 0xFF374151; // gray-700
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
}
