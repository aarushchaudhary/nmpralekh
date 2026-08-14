package com.aarushchaudhary.nmpralekh;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.fragment.app.Fragment;

import com.aarushchaudhary.nmpralekh.auth.SessionManager;
import com.aarushchaudhary.nmpralekh.databinding.ActivityAdminBinding;
import com.aarushchaudhary.nmpralekh.fragments.CertificationsFragment;
import com.aarushchaudhary.nmpralekh.fragments.ClubsFragment;
import com.aarushchaudhary.nmpralekh.fragments.FDPFragment;
import com.aarushchaudhary.nmpralekh.fragments.FacultiesFragment;
import com.aarushchaudhary.nmpralekh.fragments.HomeDashboardFragment;
import com.aarushchaudhary.nmpralekh.fragments.PatentsFragment;
import com.aarushchaudhary.nmpralekh.fragments.PlacementsFragment;
import com.aarushchaudhary.nmpralekh.fragments.PublicationsFragment;
import com.aarushchaudhary.nmpralekh.fragments.ReceivedMISDataFragment;
import com.aarushchaudhary.nmpralekh.fragments.SchoolActivitiesFragment;
import com.aarushchaudhary.nmpralekh.fragments.StudentActivitiesFragment;
import com.google.android.material.navigation.NavigationView;

public class AdminActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener,
        HomeDashboardFragment.OnModuleClickListener {

    private ActivityAdminBinding binding;
    private ActionBarDrawerToggle toggle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Setup Toolbar
        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Admin Dashboard");
        }

        // Setup Drawer Toggle
        toggle = new ActionBarDrawerToggle(this, binding.drawerLayout, binding.toolbar,
                R.string.nav_open, R.string.nav_close);
        binding.drawerLayout.addDrawerListener(toggle);
        toggle.syncState();

        // Setup Navigation View
        binding.navView.setNavigationItemSelectedListener(this);

        // Set nav header user info
        View headerView = binding.navView.getHeaderView(0);
        if (headerView != null) {
            SessionManager session = new SessionManager(this);
            TextView tvName = headerView.findViewById(R.id.tvNavHeaderName);
            TextView tvSubtitle = headerView.findViewById(R.id.tvNavHeaderSubtitle);
            if (tvName != null && !session.getFullName().isEmpty()) {
                tvName.setText(session.getFullName());
            }
            if (tvSubtitle != null) {
                tvSubtitle.setText("NMPralekh · Admin");
            }
        }

        // Load default fragment
        if (savedInstanceState == null) {
            loadFragment(new HomeDashboardFragment());
            binding.navView.setCheckedItem(R.id.nav_dashboard);
        }
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        Fragment fragment = null;
        String title = "Admin Dashboard";

        if (id == R.id.nav_dashboard) {
            fragment = new HomeDashboardFragment();
            title = "Dashboard";
        } else if (id == R.id.nav_clubs) {
            fragment = new ClubsFragment();
            title = "Clubs & Committees";
        } else if (id == R.id.nav_faculties) {
            fragment = new FacultiesFragment();
            title = "Faculties";
        } else if (id == R.id.nav_school_activities) {
            fragment = new SchoolActivitiesFragment();
            title = "School Activities";
        } else if (id == R.id.nav_student_activities) {
            fragment = new StudentActivitiesFragment();
            title = "Student Activities";
        } else if (id == R.id.nav_fdp) {
            fragment = new FDPFragment();
            title = "FDP / Workshop / GL";
        } else if (id == R.id.nav_placements) {
            fragment = new PlacementsFragment();
            title = "Placements";
        } else if (id == R.id.nav_publications) {
            fragment = new PublicationsFragment();
            title = "Publications";
        } else if (id == R.id.nav_patents) {
            fragment = new PatentsFragment();
            title = "Patents";
        } else if (id == R.id.nav_certifications) {
            fragment = new CertificationsFragment();
            title = "Certifications";
        } else if (id == R.id.nav_received_mis_data) {
            fragment = new ReceivedMISDataFragment();
            title = "Received MIS Data";
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
    public void onModuleClick(String moduleKey) {
        Fragment fragment = null;
        String title = "";
        int navId = -1;

        switch (moduleKey) {
            case "clubs":
                fragment = new ClubsFragment();
                title = "Clubs & Committees";
                navId = R.id.nav_clubs;
                break;
            case "faculties":
                fragment = new FacultiesFragment();
                title = "Faculties";
                navId = R.id.nav_faculties;
                break;
            case "school_activities":
                fragment = new SchoolActivitiesFragment();
                title = "School Activities";
                navId = R.id.nav_school_activities;
                break;
            case "student_activities":
                fragment = new StudentActivitiesFragment();
                title = "Student Activities";
                navId = R.id.nav_student_activities;
                break;
            case "fdp":
                fragment = new FDPFragment();
                title = "FDP / Workshop / GL";
                navId = R.id.nav_fdp;
                break;
            case "placements":
                fragment = new PlacementsFragment();
                title = "Placements";
                navId = R.id.nav_placements;
                break;
            case "publications":
                fragment = new PublicationsFragment();
                title = "Publications";
                navId = R.id.nav_publications;
                break;
            case "patents":
                fragment = new PatentsFragment();
                title = "Patents";
                navId = R.id.nav_patents;
                break;
            case "certifications":
                fragment = new CertificationsFragment();
                title = "Certifications";
                navId = R.id.nav_certifications;
                break;
        }

        if (fragment != null) {
            loadFragment(fragment);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle(title);
            }
            if (navId != -1) {
                binding.navView.setCheckedItem(navId);
            }
        }
    }

    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
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