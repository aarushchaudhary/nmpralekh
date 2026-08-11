package com.aarushchaudhary.nmpralekh.fragments;

import android.content.Context;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;

import com.aarushchaudhary.nmpralekh.ApiClient;
import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.aarushchaudhary.nmpralekh.databinding.FragmentHomeDashboardBinding;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
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

    private final String[][] modules = {
            {"school_activities", "School Activities"},
            {"student_activities", "Student Activities"},
            {"fdp", "FDP / Workshop / GL"},
            {"publications", "Publications"},
            {"patents", "Patents"},
            {"certifications", "Certifications"},
            {"placements", "Placements"}
    };

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
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        sessionManager = new SessionManager(requireContext());
        apiService = ApiClient.getApiService(requireContext());

        binding.tvWelcome.setText("Welcome, " + sessionManager.getFullName());

        loadSchools();
        loadCounts();
    }

    private void loadSchools() {
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

    private void populateGrid(JsonObject countsObj) {
        binding.gridModules.removeAllViews();
        
        int margin = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 6, getResources().getDisplayMetrics());
        int padding = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 16, getResources().getDisplayMetrics());
        int cornerRadius = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 12, getResources().getDisplayMetrics());
        int elevation = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 2, getResources().getDisplayMetrics());

        for (String[] module : modules) {
            String key = module[0];
            String label = module[1];
            int count = countsObj.has(key) ? countsObj.get(key).getAsInt() : 0;

            CardView cardView = new CardView(requireContext());
            GridLayout.LayoutParams params = new GridLayout.LayoutParams();
            params.width = 0;
            params.height = GridLayout.LayoutParams.WRAP_CONTENT;
            params.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
            params.setMargins(margin, margin, margin, margin);
            cardView.setLayoutParams(params);
            
            cardView.setRadius(cornerRadius);
            cardView.setCardElevation(elevation);
            cardView.setCardBackgroundColor(android.graphics.Color.WHITE);
            cardView.setClickable(true);
            cardView.setFocusable(true);
            
            TypedValue outValue = new TypedValue();
            requireContext().getTheme().resolveAttribute(android.R.attr.selectableItemBackground, outValue, true);
            cardView.setForeground(requireContext().getDrawable(outValue.resourceId));

            cardView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onModuleClick(key);
                }
            });

            LinearLayout layout = new LinearLayout(requireContext());
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(padding, padding, padding, padding);
            layout.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvCount = new TextView(requireContext());
            tvCount.setText(String.valueOf(count));
            tvCount.setTextSize(TypedValue.COMPLEX_UNIT_SP, 28);
            tvCount.setTextColor(android.graphics.Color.parseColor("#111827"));
            tvCount.setTypeface(null, android.graphics.Typeface.BOLD);

            TextView tvLabel = new TextView(requireContext());
            tvLabel.setText(label);
            tvLabel.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            tvLabel.setTextColor(android.graphics.Color.parseColor("#6B7280"));
            tvLabel.setPadding(0, (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 4, getResources().getDisplayMetrics()), 0, 0);

            layout.addView(tvCount);
            layout.addView(tvLabel);
            cardView.addView(layout);

            binding.gridModules.addView(cardView);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
