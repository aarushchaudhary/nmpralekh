package com.aarushchaudhary.nmpralekh;

import android.os.Bundle;
import android.view.MenuItem;
import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.fragment.app.Fragment;
import com.aarushchaudhary.nmpralekh.databinding.ActivityFacultyBinding;
import com.google.android.material.navigation.NavigationView;

public class FacultyActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {

    private ActivityFacultyBinding binding;
    private ActionBarDrawerToggle toggle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityFacultyBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Setup Toolbar
        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Faculty Dashboard");
        }

        // Setup Drawer Toggle
        toggle = new ActionBarDrawerToggle(this, binding.drawerLayout, binding.toolbar, R.string.nav_open, R.string.nav_close);
        binding.drawerLayout.addDrawerListener(toggle);
        toggle.syncState();

        // Setup Navigation View
        binding.navView.setNavigationItemSelectedListener(this);

        // Load default fragment
        if (savedInstanceState == null) {
            loadFragment(DashboardFragment.newInstance("Dashboard"));
            binding.navView.setCheckedItem(R.id.nav_dashboard);
        }
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        String title = item.getTitle().toString();
        loadFragment(DashboardFragment.newInstance(title));
        
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(title);
        }
        
        binding.drawerLayout.closeDrawer(GravityCompat.START);
        return true;
    }

    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
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