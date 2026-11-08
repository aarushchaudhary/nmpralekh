package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.aarushchaudhary.nmpralekh.auth.SessionManager;

public abstract class BaseAuthActivity extends AppCompatActivity {
    /** Drawer header sits under the status bar (edge-to-edge): Material pads the menu, not the header. */
    protected static void padBelowStatusBar(View header) {
        header.post(() -> {
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(header);
            if (insets == null) return;
            int top = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            header.setPadding(header.getPaddingLeft(), top, header.getPaddingRight(), header.getPaddingBottom());
        });
    }

    protected void performLogout() {
        new SessionManager(this).clear();

        // Cookies are attached when the request runs, so clear them only after it finishes:
        // the server needs the refresh cookie to revoke the token.
        try {
            ApiClient.getApiService(this).logout().enqueue(new retrofit2.Callback<com.google.gson.JsonObject>() {
                @Override
                public void onResponse(retrofit2.Call<com.google.gson.JsonObject> call,
                        retrofit2.Response<com.google.gson.JsonObject> response) {
                    ApiClient.clearCookies();
                }

                @Override
                public void onFailure(retrofit2.Call<com.google.gson.JsonObject> call, Throwable t) {
                    ApiClient.clearCookies();
                }
            });
        } catch (Exception ignored) {
            ApiClient.clearCookies();
        }

        // Go to login
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
