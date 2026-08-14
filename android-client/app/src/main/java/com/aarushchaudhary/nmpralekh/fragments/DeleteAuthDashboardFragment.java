package com.aarushchaudhary.nmpralekh.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.aarushchaudhary.nmpralekh.ApiClient;
import com.aarushchaudhary.nmpralekh.R;
import com.aarushchaudhary.nmpralekh.adapters.AuditAdapter;
import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DeleteAuthDashboardFragment extends Fragment {

    private TextView tvWelcome, tvPendingCount, tvApprovedCount, tvRejectedCount, tvEmpty, tvViewAll;
    private ProgressBar progressBar;
    private RecyclerView rvRecent;
    private AuditAdapter adapter;
    private ApiService apiService;

    public interface OnViewAllClickListener {
        void onViewAllClick();
    }
    private OnViewAllClickListener listener;

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        if (context instanceof OnViewAllClickListener) {
            listener = (OnViewAllClickListener) context;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_deleteauth_dashboard, container, false);
        
        tvWelcome = view.findViewById(R.id.tvWelcome);
        tvPendingCount = view.findViewById(R.id.tvPendingCount);
        tvApprovedCount = view.findViewById(R.id.tvApprovedCount);
        tvRejectedCount = view.findViewById(R.id.tvRejectedCount);
        tvEmpty = view.findViewById(R.id.tvEmpty);
        tvViewAll = view.findViewById(R.id.tvViewAll);
        progressBar = view.findViewById(R.id.progressBar);
        rvRecent = view.findViewById(R.id.rvRecent);
        
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        SessionManager sessionManager = new SessionManager(requireContext());
        tvWelcome.setText("Welcome, " + sessionManager.getFullName());

        tvViewAll.setOnClickListener(v -> {
            if (listener != null) listener.onViewAllClick();
        });

        apiService = ApiClient.getApiService(requireContext());
        
        adapter = new AuditAdapter(requireContext(), false, new AuditAdapter.OnAuditActionListener() {
            @Override
            public void onApprove(int id) {
                apiService.approveAudit(id).enqueue(new Callback<JsonObject>() {
                    @Override
                    public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                        if (response.isSuccessful()) {
                            Toast.makeText(getContext(), "Approved", Toast.LENGTH_SHORT).show();
                            loadData();
                        }
                    }
                    @Override
                    public void onFailure(Call<JsonObject> call, Throwable t) {}
                });
            }

            @Override
            public void onReject(int id) {
                apiService.rejectAudit(id).enqueue(new Callback<JsonObject>() {
                    @Override
                    public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                        if (response.isSuccessful()) {
                            Toast.makeText(getContext(), "Rejected", Toast.LENGTH_SHORT).show();
                            loadData();
                        }
                    }
                    @Override
                    public void onFailure(Call<JsonObject> call, Throwable t) {}
                });
            }
        });

        rvRecent.setLayoutManager(new LinearLayoutManager(getContext()));
        rvRecent.setAdapter(adapter);

        loadData();
    }

    private void loadData() {
        progressBar.setVisibility(View.VISIBLE);
        rvRecent.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);

        apiService.getPendingAudits(new HashMap<>()).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonObject body = response.body();
                    JsonArray results = new JsonArray();
                    if (body.has("results")) {
                        results = body.getAsJsonArray("results");
                    }
                    
                    List<JsonObject> pendingItems = new ArrayList<>();
                    for (JsonElement el : results) {
                        if (el.isJsonObject()) pendingItems.add(el.getAsJsonObject());
                    }

                    tvPendingCount.setText(String.valueOf(pendingItems.size()));
                    
                    if (pendingItems.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    } else {
                        rvRecent.setVisibility(View.VISIBLE);
                        // Show top 5
                        List<JsonObject> recent = pendingItems.size() > 5 ? pendingItems.subList(0, 5) : pendingItems;
                        adapter.setAudits(recent);
                    }
                }
                checkProgress();
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) { checkProgress(); }
        });

        apiService.getAuditHistory(new HashMap<>()).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonObject body = response.body();
                    JsonArray results = new JsonArray();
                    if (body.has("results")) {
                        results = body.getAsJsonArray("results");
                    }
                    
                    int approved = 0;
                    int rejected = 0;
                    
                    for (JsonElement el : results) {
                        if (el.isJsonObject()) {
                            JsonObject obj = el.getAsJsonObject();
                            if (obj.has("status") && !obj.get("status").isJsonNull()) {
                                String status = obj.get("status").getAsString();
                                if ("approved".equalsIgnoreCase(status)) approved++;
                                else if ("rejected".equalsIgnoreCase(status)) rejected++;
                            }
                        }
                    }

                    tvApprovedCount.setText(String.valueOf(approved));
                    tvRejectedCount.setText(String.valueOf(rejected));
                }
                checkProgress();
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) { checkProgress(); }
        });
    }

    private int callsCompleted = 0;
    private void checkProgress() {
        callsCompleted++;
        if (callsCompleted >= 2) {
            progressBar.setVisibility(View.GONE);
            callsCompleted = 0;
        }
    }
}
