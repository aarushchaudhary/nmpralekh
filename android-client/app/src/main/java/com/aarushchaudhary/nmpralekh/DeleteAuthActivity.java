package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.fragment.app.Fragment;

import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.aarushchaudhary.nmpralekh.databinding.ActivityDeleteauthBinding;
import com.aarushchaudhary.nmpralekh.fragments.DeleteAuthPendingFragment;
import com.aarushchaudhary.nmpralekh.fragments.DeleteAuthHistoryFragment;
import com.aarushchaudhary.nmpralekh.fragments.DeleteAuthDashboardFragment;
import com.google.android.material.navigation.NavigationView;

public class DeleteAuthActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener,
        DeleteAuthDashboardFragment.OnViewAllClickListener {

    private ActivityDeleteauthBinding binding;
    private ActionBarDrawerToggle toggle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityDeleteauthBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Setup Toolbar
        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Delete Auth Dashboard");
        }

        // Setup Drawer Toggle
        toggle = new ActionBarDrawerToggle(
                this, binding.drawerLayout, binding.toolbar,
                R.string.nav_open,
                R.string.nav_close);
        binding.drawerLayout.addDrawerListener(toggle);
        toggle.syncState();

        // Setup Navigation View
        binding.navView.setNavigationItemSelectedListener(this);
        binding.navView.setCheckedItem(R.id.nav_dashboard);

        // Load Default Fragment
        if (savedInstanceState == null) {
            loadFragment(new DeleteAuthDashboardFragment());
        }
    }

    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        Fragment fragment = null;
        String title = "Delete Auth Dashboard";

        if (id == R.id.nav_dashboard) {
            fragment = new DeleteAuthDashboardFragment();
            title = "Dashboard";
        } else if (id == R.id.nav_pending) {
            fragment = new DeleteAuthPendingFragment();
            title = "Pending Requests";
        } else if (id == R.id.nav_history) {
            fragment = new DeleteAuthHistoryFragment();
            title = "History";
        } else if (id == R.id.nav_logout) {
            performLogout();
            binding.drawerLayout.closeDrawer(GravityCompat.START);
            return true;
        }

        if (fragment != null) {
            loadFragment(fragment);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle(title);
            }
        }

        binding.drawerLayout.closeDrawer(GravityCompat.START);
        return true;
    }

    @Override
    public void onViewAllClick() {
        loadFragment(new DeleteAuthPendingFragment());
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Pending Requests");
        }
        binding.navView.setCheckedItem(R.id.nav_pending);
    }

    private void performLogout() {
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
        Toast.makeText(this, "Signed out", Toast.LENGTH_SHORT).show();
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed() {
        if (binding.drawerLayout.isDrawerOpen(GravityCompat.START)) {
            binding.drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }
}