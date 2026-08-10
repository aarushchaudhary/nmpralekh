package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.aarushchaudhary.nmpralekh.databinding.ActivityLoginBinding;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize ViewBinding
        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Setup SharedPreferences to store the Server URL
        prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);

        // Handle Settings Button Click
        binding.btnSettings.setOnClickListener(v -> showSettingsDialog());

        // Handle Login Button Click
        binding.btnLogin.setOnClickListener(v -> {
            String username = binding.etUsername.getText().toString().trim();
            String password = binding.etPassword.getText().toString().trim();

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter username and password", Toast.LENGTH_SHORT).show();
                return;
            }

            String serverUrl = prefs.getString("SERVER_URL", "http://10.0.2.2:8000");
            // Ensure URL doesn't end with slash before appending path
            if (serverUrl.endsWith("/")) {
                serverUrl = serverUrl.substring(0, serverUrl.length() - 1);
            }
            String loginUrl = serverUrl + "/api/auth/login/";

            binding.btnLogin.setText("Logging in...");
            binding.btnLogin.setEnabled(false);

            okhttp3.OkHttpClient client = new okhttp3.OkHttpClient();
            org.json.JSONObject jsonObject = new org.json.JSONObject();
            try {
                jsonObject.put("username", username);
                jsonObject.put("password", password);
            } catch (org.json.JSONException e) {
                e.printStackTrace();
            }
            String json = jsonObject.toString();
            okhttp3.RequestBody body = okhttp3.RequestBody.create(json, okhttp3.MediaType.parse("application/json; charset=utf-8"));

            okhttp3.Request request = new okhttp3.Request.Builder()
                    .url(loginUrl)
                    .post(body)
                    .build();

            client.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(okhttp3.Call call, java.io.IOException e) {
                    runOnUiThread(() -> {
                        Toast.makeText(LoginActivity.this, "Connection failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        binding.btnLogin.setText("Sign In");
                        binding.btnLogin.setEnabled(true);
                    });
                }

                @Override
                public void onResponse(okhttp3.Call call, okhttp3.Response response) throws java.io.IOException {
                    runOnUiThread(() -> {
                        binding.btnLogin.setText("Sign In");
                        binding.btnLogin.setEnabled(true);
                        if (response.isSuccessful()) {
                            Toast.makeText(LoginActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
                            Intent intent = new Intent(LoginActivity.this, FacultyActivity.class);
                            startActivity(intent);
                            finish();
                        } else {
                            Toast.makeText(LoginActivity.this, "Invalid credentials or unauthorized", Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            });
        });
    }

    private void showSettingsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Server Configuration");

        // Create an EditText for the dialog programmatically
        final EditText input = new EditText(this);
        input.setHint("http://10.0.2.2:8000");

        // Pre-fill with existing URL if available
        String currentUrl = prefs.getString("SERVER_URL", "http://10.0.2.2:8000");
        input.setText(currentUrl);

        // Add padding to match the fluent vibe slightly
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT);
        input.setLayoutParams(lp);
        builder.setView(input);

        // Save Button
        builder.setPositiveButton("Save", (dialog, which) -> {
            String newUrl = input.getText().toString().trim();
            prefs.edit().putString("SERVER_URL", newUrl).apply();
            Toast.makeText(this, "Server URL saved", Toast.LENGTH_SHORT).show();
        });

        // Cancel Button
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());

        builder.show();
    }
}