package com.aarushchaudhary.nmpralekh.auth;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.gson.JsonObject;

public class SessionManager {
    private static final String PREF_NAME = "UserSession";
    private static final String KEY_FULL_NAME = "full_name";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_ROLE = "role";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";

    private final SharedPreferences prefs;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void saveUser(JsonObject user) {
        SharedPreferences.Editor editor = prefs.edit();
        if (user.has("full_name")) editor.putString(KEY_FULL_NAME, user.get("full_name").getAsString());
        if (user.has("username")) editor.putString(KEY_USERNAME, user.get("username").getAsString());
        if (user.has("role")) editor.putString(KEY_ROLE, user.get("role").getAsString());
        if (user.has("id")) editor.putInt(KEY_USER_ID, user.get("id").getAsInt());
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.apply();
    }

    public String getFullName() { return prefs.getString(KEY_FULL_NAME, ""); }
    public String getUsername() { return prefs.getString(KEY_USERNAME, ""); }
    public String getRole() { return prefs.getString(KEY_ROLE, ""); }
    public int getUserId() { return prefs.getInt(KEY_USER_ID, -1); }
    public boolean isLoggedIn() { return prefs.getBoolean(KEY_IS_LOGGED_IN, false); }

    public void clear() {
        prefs.edit().clear().apply();
    }
}
