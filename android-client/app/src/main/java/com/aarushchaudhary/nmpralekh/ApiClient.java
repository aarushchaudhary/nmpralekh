package com.aarushchaudhary.nmpralekh;

import android.content.Context;
import android.content.SharedPreferences;

import com.aarushchaudhary.nmpralekh.api.ApiService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import okhttp3.Cookie;
import okhttp3.CookieJar;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    private static ApiService apiService = null;
    private static String currentBaseUrl = null;
    private static final Map<String, List<Cookie>> cookieStore = new HashMap<>();

    public static void clearCookies() {
        cookieStore.clear();
    }

    public static ApiService getApiService(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
        String baseUrl = prefs.getString("SERVER_URL", "http://10.0.2.2:8000");

        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }

        // Rebuild if URL changed
        if (apiService != null && baseUrl.equals(currentBaseUrl)) {
            return apiService;
        }

        currentBaseUrl = baseUrl;

        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        CookieJar cookieJar = new CookieJar() {
            @Override
            public void saveFromResponse(HttpUrl url, List<Cookie> cookies) {
                String host = url.host();
                List<Cookie> existingCookies = cookieStore.get(host);
                if (existingCookies == null) {
                    existingCookies = new ArrayList<>();
                }
                // Update or add cookies
                for (Cookie newCookie : cookies) {
                    existingCookies.removeIf(c -> c.name().equals(newCookie.name()));
                    existingCookies.add(newCookie);
                }
                cookieStore.put(host, existingCookies);
            }

            @Override
            public List<Cookie> loadForRequest(HttpUrl url) {
                List<Cookie> cookies = cookieStore.get(url.host());
                return cookies != null ? cookies : new ArrayList<>();
            }
        };

        OkHttpClient client = new OkHttpClient.Builder()
                .cookieJar(cookieJar)
                .addInterceptor(chain -> {
                    okhttp3.Request original = chain.request();
                    okhttp3.Request.Builder builder = original.newBuilder();
                    
                    List<Cookie> cookies = cookieStore.get(original.url().host());
                    if (cookies != null) {
                        for (Cookie cookie : cookies) {
                            if ("csrftoken".equals(cookie.name())) {
                                builder.header("X-CSRFToken", cookie.value());
                                break;
                            }
                        }
                    }
                    
                    return chain.proceed(builder.build());
                })
                .addInterceptor(logging)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .client(client)
                .build();

        apiService = retrofit.create(ApiService.class);
        return apiService;
    }

    // Force rebuild on next call (e.g. after changing server URL)
    public static void reset() {
        apiService = null;
        currentBaseUrl = null;
        cookieStore.clear();
    }
}