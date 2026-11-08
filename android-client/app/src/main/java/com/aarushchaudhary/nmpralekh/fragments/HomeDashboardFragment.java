package com.aarushchaudhary.nmpralekh.fragments;
import java.util.Map;
import retrofit2.Call;

import android.content.Context;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.aarushchaudhary.nmpralekh.ApiClient;
import com.aarushchaudhary.nmpralekh.R;
import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.aarushchaudhary.nmpralekh.databinding.FragmentHomeDashboardBinding;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;



import retrofit2.Callback;
import retrofit2.Response;

public class HomeDashboardFragment extends Fragment {

    public interface OnModuleClickListener {
        void onModuleClick(String moduleKey);
    }

    private FragmentHomeDashboardBinding binding;
    private OnModuleClickListener listener;
    private SessionManager sessionManager;
    private ApiService apiService;

    private String[][] modules;

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        if (context instanceof OnModuleClickListener) {
            listener = (OnModuleClickListener) context;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHomeDashboardBinding.inflate(inflater, container, false);
        sessionManager = new SessionManager(requireContext());
        apiService = ApiClient.getApiService(requireContext());

        String role = sessionManager.getRole();
        if (role.equals("admin") || role.equals("super_admin") || role.equals("coordinator")) {
            modules = new String[][]{
                {"school_activities", "School Activities"},
                {"student_activities", "Student Activities"},
                {"fdp", "FDP / Workshop / GL"},
                {"placements", "Placements"},
                {"publications", "Publications"},
                {"patents", "Patents"},
                {"certifications", "Certifications"}
            };
        } else {
            modules = new String[][]{
                {"school_activities", "School Activities"},
                {"student_activities", "Student Activities"},
                {"fdp", "FDP / Workshop / GL"},
                {"publications", "My Publications"},
                {"patents", "My Patents"},
                {"certifications", "My Certifications"},
                {"placements", "Placements"}
            };
        }

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        binding.tvWelcome.setText("Welcome, " + sessionManager.getFullName());

        loadSchools();
        loadCounts();
    }

    private void loadSchools() {
        if ("super_admin".equals(sessionManager.getRole())) {
            apiService.getAllSchools().enqueue(new Callback<JsonElement>() {
                @Override
                public void onResponse(Call<JsonElement> call, Response<JsonElement> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        List<String> schoolNames = new ArrayList<>();
                        JsonElement body = response.body();
                        JsonArray results = new JsonArray();
                        if (body.isJsonObject() && body.getAsJsonObject().has("results")) {
                            results = body.getAsJsonObject().getAsJsonArray("results");
                        } else if (body.isJsonArray()) {
                            results = body.getAsJsonArray();
                        }
                        for (JsonElement el : results) {
                            if (el.isJsonObject()) {
                                JsonObject obj = el.getAsJsonObject();
                                if (obj.has("is_active") && obj.get("is_active").getAsBoolean()) {
                                    if (obj.has("name")) {
                                        schoolNames.add(obj.get("name").getAsString());
                                    }
                                }
                            }
                        }
                        if (schoolNames.isEmpty()) {
                            binding.tvSchools.setText("No active schools");
                        } else {
                            binding.tvSchools.setText(String.join(", ", schoolNames));
                        }
                    } else {
                        binding.tvSchools.setText("Failed to load schools");
                    }
                }

                @Override
                public void onFailure(Call<JsonElement> call, Throwable t) {
                    binding.tvSchools.setText("Error: " + t.getMessage());
                }
            });
        } else {
            apiService.getMySchools().enqueue(new Callback<List<JsonObject>>() {
                @Override
                public void onResponse(Call<List<JsonObject>> call, Response<List<JsonObject>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        List<String> schoolNames = new ArrayList<>();
                        for (JsonObject obj : response.body()) {
                            if (obj.has("name")) {
                                schoolNames.add(obj.get("name").getAsString());
                            }
                        }
                        if (schoolNames.isEmpty()) {
                            binding.tvSchools.setText("No schools assigned");
                        } else {
                            binding.tvSchools.setText(String.join(", ", schoolNames));
                        }
                    } else {
                        binding.tvSchools.setText("Failed to load schools");
                    }
                }

                @Override
                public void onFailure(Call<List<JsonObject>> call, Throwable t) {
                    binding.tvSchools.setText("Error: " + t.getMessage());
                }
            });
        }
    }

    private void loadCounts() {
        apiService.getDashboardCounts().enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                binding.progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    binding.gridModules.setVisibility(View.VISIBLE);
                    populateGrid(response.body());
                } else {
                    Toast.makeText(requireContext(), "Failed to load dashboard data", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                binding.progressBar.setVisibility(View.GONE);
                Toast.makeText(requireContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // One ruled KPI strip like the web StatCard grid: white tiles, 1dp rules, no shadows.
    private void populateGrid(JsonObject countsObj) {
        binding.gridModules.removeAllViews();
        binding.gridModules.setClipToOutline(true); // keep the strip's rounded corners over square tiles

        int n = modules.length;
        int rows = (n + 1) / 2;
        int rule = Math.max(1, Math.round(dp(1)));
        int pad = Math.round(dp(14));

        for (int i = 0; i < n; i++) {
            String key = modules[i][0];
            String label = modules[i][1];
            int count = countsObj.has(key) ? countsObj.get(key).getAsInt() : 0;
            boolean lastOdd = (n % 2 == 1) && i == n - 1; // fills the row instead of leaving a gap
            int row = i / 2, col = i % 2;

            GridLayout.LayoutParams params = new GridLayout.LayoutParams(
                    GridLayout.spec(row), GridLayout.spec(col, lastOdd ? 2 : 1, 1f));
            params.width = 0;
            params.setMargins(0, 0, (col == 0 && !lastOdd) ? rule : 0, row < rows - 1 ? rule : 0);

            LinearLayout tile = new LinearLayout(requireContext());
            tile.setOrientation(LinearLayout.VERTICAL);
            tile.setLayoutParams(params);
            tile.setPadding(pad, pad, pad, pad);
            tile.setBackgroundColor(requireContext().getColor(R.color.white));
            TypedValue ripple = new TypedValue();
            requireContext().getTheme().resolveAttribute(android.R.attr.selectableItemBackground, ripple, true);
            tile.setForeground(requireContext().getDrawable(ripple.resourceId));
            tile.setClickable(true);
            tile.setFocusable(true);
            tile.setContentDescription(label + ": " + count + ". View records");
            tile.setOnClickListener(v -> {
                if (listener != null) listener.onModuleClick(key);
            });

            tile.addView(text(label, 12, R.color.gray_600, false));
            TextView value = text(String.valueOf(count), 22, R.color.gray_900, true);
            value.setPadding(0, Math.round(dp(2)), 0, 0);
            value.setFontFeatureSettings("tnum");
            tile.addView(value);
            TextView link = text("View records", 12, R.color.red_700, true);
            link.setPadding(0, Math.round(dp(2)), 0, 0);
            tile.addView(link);

            binding.gridModules.addView(tile);
        }
    }

    private TextView text(String s, int sp, int colorRes, boolean medium) {
        TextView tv = new TextView(requireContext());
        tv.setText(s);
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        tv.setTextColor(requireContext().getColor(colorRes));
        if (medium) tv.setTypeface(android.graphics.Typeface.create("sans-serif-medium", android.graphics.Typeface.NORMAL));
        tv.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO); // the tile announces itself
        return tv;
    }

    private float dp(int v) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
