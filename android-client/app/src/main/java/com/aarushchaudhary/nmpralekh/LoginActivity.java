package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.aarushchaudhary.nmpralekh.databinding.ActivityLoginBinding;
import com.google.gson.JsonObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);

        // Check if already logged in AND we have cookies (session survived)
        SessionManager session = new SessionManager(this);
        if (session.isLoggedIn() && ApiClient.hasCookies()) {
            navigateBasedOnRole();
            return;
        }

        // If not fully logged in but we have a saved username, pre-fill it
        String savedUsername = session.getUsername();
        if (!savedUsername.isEmpty()) {
            binding.etUsername.setText(savedUsername);
            binding.etPassword.requestFocus();
        }

        binding.btnSettings.setOnClickListener(v -> showSettingsDialog());

        binding.btnLogin.setOnClickListener(v -> {
            String username = binding.etUsername.getText().toString().trim();
            String password = binding.etPassword.getText().toString().trim();

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter username and password", Toast.LENGTH_SHORT).show();
                return;
            }

            binding.btnLogin.setText("Logging in...");
            binding.btnLogin.setEnabled(false);

            // Reset ApiClient in case server URL changed
            ApiClient.reset();
            ApiService apiService = ApiClient.getApiService(this);

            JsonObject credentials = new JsonObject();
            credentials.addProperty("username", username);
            credentials.addProperty("password", password);

            apiService.login(credentials).enqueue(new Callback<JsonObject>() {
                @Override
                public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                    runOnUiThread(() -> {
                        binding.btnLogin.setText("Sign In");
                        binding.btnLogin.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null) {
                            JsonObject body = response.body();

                            // Save user data to session
                            SessionManager session = new SessionManager(LoginActivity.this);
                            if (body.has("user")) {
                                session.saveUser(body.getAsJsonObject("user"));
                            } else {
                                // Some backends return user data at top level
                                session.saveUser(body);
                            }

                            Toast.makeText(LoginActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
                            navigateBasedOnRole();
                        } else {
                            Toast.makeText(LoginActivity.this, "Invalid credentials or unauthorized", Toast.LENGTH_SHORT).show();
                        }
                    });
                }

                @Override
                public void onFailure(Call<JsonObject> call, Throwable t) {
                    runOnUiThread(() -> {
                        binding.btnLogin.setText("Sign In");
                        binding.btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this, "Connection failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    });
                }
            });
        });
    }

    private void navigateBasedOnRole() {
        SessionManager session = new SessionManager(this);
        String role = session.getRole();
        Intent intent;
        
        if (role.equals("super_admin")) {
            intent = new Intent(this, SuperAdminActivity.class);
        } else if (role.equals("delete_auth")) {
            intent = new Intent(this, DeleteAuthActivity.class);
        } else if (role.equals("admin") || role.equals("coordinator")) {
            intent = new Intent(this, AdminActivity.class);
        } else {
            intent = new Intent(this, FacultyActivity.class);
        }
        
        startActivity(intent);
        finish();
    }

    private void showSettingsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Server Configuration");

        final EditText input = new EditText(this);
        input.setHint("http://10.0.2.2:8000");

        String currentUrl = prefs.getString("SERVER_URL", "http://10.0.2.2:8000");
        input.setText(currentUrl);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT);
        input.setLayoutParams(lp);
        builder.setView(input);

        builder.setPositiveButton("Save", (dialog, which) -> {
            String newUrl = input.getText().toString().trim();
            prefs.edit().putString("SERVER_URL", newUrl).apply();
            ApiClient.reset(); // Force rebuild with new URL
            Toast.makeText(this, "Server URL saved", Toast.LENGTH_SHORT).show();
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());

        builder.show();
    }
}