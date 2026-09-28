package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import androidx.appcompat.app.AppCompatActivity;

import com.aarushchaudhary.nmpralekh.auth.SessionManager;

public abstract class BaseAuthActivity extends AppCompatActivity {
    protected void performLogout() {
        // Clear session
        new SessionManager(this).clear();
        ApiClient.clearCookies();

        // Call logout API (fire and forget)
        try {
            ApiClient.getApiService(this).logout().enqueue(new retrofit2.Callback<com.google.gson.JsonObject>() {
                @Override
                public void onResponse(retrofit2.Call<com.google.gson.JsonObject> call,
                        retrofit2.Response<com.google.gson.JsonObject> response) {
                }

                @Override
                public void onFailure(retrofit2.Call<com.google.gson.JsonObject> call, Throwable t) {
                }
            });
        } catch (Exception ignored) {
        }

        // Go to login
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
