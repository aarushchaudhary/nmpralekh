package com.aarushchaudhary.nmpralekh.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.aarushchaudhary.nmpralekh.ApiClient;
import com.aarushchaudhary.nmpralekh.adapters.AuditAdapter;
import com.aarushchaudhary.nmpralekh.api.ApiService;
import com.aarushchaudhary.nmpralekh.databinding.FragmentRecordListBinding;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DeleteAuthPendingFragment extends Fragment {

    private FragmentRecordListBinding binding;
    private AuditAdapter adapter;
    private ApiService apiService;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentRecordListBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.tvPageTitle.setText("Pending Requests");
        binding.tvPageSubtitle.setText("Review and authorize pending change requests");

        binding.fabAdd.setVisibility(View.GONE);

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
                        } else {
                            Toast.makeText(getContext(), "Failed to approve", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<JsonObject> call, Throwable t) {
                        Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
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
                        } else {
                            Toast.makeText(getContext(), "Failed to reject", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<JsonObject> call, Throwable t) {
                        Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });

        binding.recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.recyclerView.setAdapter(adapter);

        loadData();
    }

    private void loadData() {
        binding.progressBar.setVisibility(View.VISIBLE);
        binding.layoutEmpty.setVisibility(View.GONE);
        binding.recyclerView.setVisibility(View.GONE);

        apiService.getPendingAudits(new HashMap<>()).enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                binding.progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    JsonObject body = response.body();
                    JsonArray results = new JsonArray();
                    if (body.has("results")) {
                        results = body.getAsJsonArray("results");
                    }
                    
                    List<JsonObject> items = new ArrayList<>();
                    for (JsonElement el : results) {
                        if (el.isJsonObject()) {
                            items.add(el.getAsJsonObject());
                        }
                    }

                    if (items.isEmpty()) {
                        binding.layoutEmpty.setVisibility(View.VISIBLE);
                    } else {
                        binding.recyclerView.setVisibility(View.VISIBLE);
                        adapter.setAudits(items);
                    }
                } else {
                    binding.layoutEmpty.setVisibility(View.VISIBLE);
                    Toast.makeText(getContext(), "Failed to load requests", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                binding.progressBar.setVisibility(View.GONE);
                binding.layoutEmpty.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
