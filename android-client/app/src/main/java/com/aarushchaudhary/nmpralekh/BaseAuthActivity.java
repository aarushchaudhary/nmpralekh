package com.aarushchaudhary.nmpralekh;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.util.TypedValue;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.Map;

public abstract class BaseAuthActivity extends AppCompatActivity {
    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        // the server refuses everything else until the reset password is replaced
        if (new SessionManager(this).mustChangePassword()) showChangePasswordDialog(true);
    }

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

    /** Drawer "Change password": the signed-in user sets a new one; the server signs out their other devices. */
    protected void showChangePasswordDialog() {
        showChangePasswordDialog(false);
    }

    /** forced: after a reset by the person above; can't be cancelled until a new password is saved. */
    protected void showChangePasswordDialog(boolean forced) {
        int pad = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 20, getResources().getDisplayMetrics());
        LinearLayout form = new LinearLayout(this);
        form.setOrientation(LinearLayout.VERTICAL);
        form.setPadding(pad, pad / 2, pad, 0);
        if (forced) {
            TextView intro = new TextView(this);
            intro.setText("Your password was reset. Enter the one-time password you were given, then choose your own.");
            intro.setPadding(0, 0, 0, pad / 2);
            form.addView(intro);
        }
        TextInputEditText current = addPasswordField(this, form, forced ? "One-time password" : "Current password");
        TextInputEditText newPassword = addPasswordField(this, form, "New password");
        TextInputEditText confirm = addPasswordField(this, form, "Confirm new password");
        TextView hint = new TextView(this);
        hint.setText("At least 8 characters, not only numbers, not a common password, and not like your name or username.");
        hint.setTextSize(12);
        form.addView(hint);
        TextView error = new TextView(this);
        error.setTextColor(getColor(R.color.red_700));
        error.setPadding(0, pad / 2, 0, 0);
        error.setVisibility(View.GONE);
        form.addView(error);

        MaterialAlertDialogBuilder builder = new MaterialAlertDialogBuilder(this)
                .setTitle(forced ? "Choose a new password" : "Change password")
                .setView(form)
                .setPositiveButton("Change password", null)  // set below, so a failure keeps the dialog open
                .setCancelable(!forced);
        if (!forced) builder.setNegativeButton("Cancel", null);
        AlertDialog dialog = builder.create();
        dialog.setOnShowListener(d -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String next = String.valueOf(newPassword.getText());
            if (!next.equals(String.valueOf(confirm.getText()))) {
                error.setText("The new passwords do not match.");
                error.setVisibility(View.VISIBLE);
                return;
            }
            JsonObject body = new JsonObject();
            body.addProperty("current_password", String.valueOf(current.getText()));
            body.addProperty("new_password", next);
            v.setEnabled(false);
            ApiClient.getApiService(this).changePassword(body).enqueue(new retrofit2.Callback<JsonObject>() {
                @Override
                public void onResponse(retrofit2.Call<JsonObject> call, retrofit2.Response<JsonObject> response) {
                    v.setEnabled(true);
                    if (response.isSuccessful()) {
                        dialog.dismiss();
                        Toast.makeText(BaseAuthActivity.this,
                                "Password changed. Your other devices were signed out.", Toast.LENGTH_LONG).show();
                        if (forced) {
                            new SessionManager(BaseAuthActivity.this).passwordChanged();
                            recreate();  // the screen behind was refused while locked; load it again
                        }
                    } else {
                        error.setText(errorMessage(response));
                        error.setVisibility(View.VISIBLE);
                    }
                }

                @Override
                public void onFailure(retrofit2.Call<JsonObject> call, Throwable t) {
                    v.setEnabled(true);
                    error.setText("Could not reach the server. Check your connection and try again.");
                    error.setVisibility(View.VISIBLE);
                }
            });
        }));
        dialog.show();
    }

    public static TextInputEditText addPasswordField(Context context, LinearLayout form, String label) {
        TextInputLayout layout = new TextInputLayout(context, null, com.google.android.material.R.attr.textInputOutlinedStyle);
        layout.setHint(label);
        layout.setEndIconMode(TextInputLayout.END_ICON_PASSWORD_TOGGLE);
        TextInputEditText field = new TextInputEditText(layout.getContext());
        field.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        layout.addView(field);
        form.addView(layout);
        return field;
    }

    /** DRF errors: {"field": ["message", ...]} or {"detail": "message"}; shows every message. */
    public static String errorMessage(retrofit2.Response<?> response) {
        try {
            StringBuilder out = new StringBuilder();
            JsonObject errors = JsonParser.parseString(response.errorBody().string()).getAsJsonObject();
            for (Map.Entry<String, JsonElement> entry : errors.entrySet()) {
                JsonElement value = entry.getValue();
                com.google.gson.JsonArray messages = new com.google.gson.JsonArray();
                if (value.isJsonArray()) messages.addAll(value.getAsJsonArray()); else messages.add(value);
                for (JsonElement message : messages) {
                    if (out.length() > 0) out.append("\n");
                    out.append(message.getAsString());
                }
            }
            return out.toString();
        } catch (Exception e) {
            return "Something went wrong (error " + response.code() + "). Please try again.";
        }
    }
}
