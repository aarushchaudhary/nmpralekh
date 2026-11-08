package com.aarushchaudhary.nmpralekh;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;

import com.aarushchaudhary.nmpralekh.api.ApiService;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import okhttp3.Cookie;
import okhttp3.CookieJar;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    private static ApiService apiService = null;
    private static String currentBaseUrl = null;
    private static OkHttpClient httpClient = null;
    private static final Object refreshLock = new Object();
    private static final Map<String, List<Cookie>> cookieStore = new ConcurrentHashMap<>();
    private static File cookieFile = null;

    public static void clearCookies() {
        cookieStore.clear();
        saveCookies();
    }

    /** True when a saved, unexpired refresh token exists, so the user can skip the login screen. */
    public static boolean hasSession(Context context) {
        loadCookies(context);
        for (List<Cookie> cookies : cookieStore.values())
            for (Cookie c : cookies) if ("refresh_token".equals(c.name())) return true;
        return false;
    }

    // Cookies (the login tokens) are kept in a file so a login survives the app being closed.
    // getNoBackupFilesDir: private to this app and, unlike SharedPreferences, never copied to cloud backups.
    private static synchronized void loadCookies(Context context) {
        if (cookieFile != null) return;
        cookieFile = new File(context.getApplicationContext().getNoBackupFilesDir(), "cookies.txt");
        try (BufferedReader r = new BufferedReader(new FileReader(cookieFile))) {
            String line;
            while ((line = r.readLine()) != null) {
                int tab = line.indexOf('\t');
                HttpUrl url = tab < 0 ? null : HttpUrl.parse("http://" + line.substring(0, tab) + "/");
                Cookie c = url == null ? null : Cookie.parse(url, line.substring(tab + 1));
                if (c != null && c.expiresAt() > System.currentTimeMillis()) {
                    cookieStore.computeIfAbsent(url.host(), h -> new ArrayList<>()).add(c);
                }
            }
        } catch (IOException ignored) { } // no file yet: nothing saved
    }

    private static synchronized void saveCookies() {
        if (cookieFile == null) return;
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, List<Cookie>> e : cookieStore.entrySet())
            for (Cookie c : e.getValue()) sb.append(e.getKey()).append('\t').append(c).append('\n');
        try (FileWriter w = new FileWriter(cookieFile)) {
            w.write(sb.toString());
        } catch (IOException ignored) { } // login then lasts only until the app closes, as before
    }

    public static ApiService getApiService(Context context) {
        loadCookies(context);
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

        // Bodies carry passwords and tokens: never log them. Debug builds log the
        // request line and status only; release builds log nothing.
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        boolean debuggable = (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        logging.setLevel(debuggable ? HttpLoggingInterceptor.Level.BASIC : HttpLoggingInterceptor.Level.NONE);

        CookieJar cookieJar = new CookieJar() {
            @Override
            public void saveFromResponse(HttpUrl url, List<Cookie> cookies) {
                String host = url.host();
                // copy, so a request reading the old list on another thread is not disturbed
                List<Cookie> existingCookies = new ArrayList<>();
                List<Cookie> old = cookieStore.get(host);
                if (old != null) existingCookies.addAll(old);
                // Update or add cookies
                for (Cookie newCookie : cookies) {
                    existingCookies.removeIf(c -> c.name().equals(newCookie.name()));
                    existingCookies.add(newCookie);
                }
                cookieStore.put(host, existingCookies);
                saveCookies();
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
                    // remember which access token this request carried, for refreshAndRetry
                    String access = cookieValue(original.url().host(), "access_token");
                    if (access != null) builder.tag(TokenUsed.class, new TokenUsed(access));
                    
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
                // The access token lasts 30 minutes: on a 401, refresh once and retry
                .authenticator((route, response) -> refreshAndRetry(response))
                .build();
        httpClient = client;

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .client(client)
                .build();

        apiService = retrofit.create(ApiService.class);
        return apiService;
    }

    private static String cookieValue(String host, String name) {
        List<Cookie> cookies = cookieStore.get(host);
        if (cookies == null) return null;
        for (Cookie c : cookies) if (name.equals(c.name())) return c.value();
        return null;
    }

    /** Runs on OkHttp's thread after a 401. Returns the request to retry, or null to give up. */
    private static Request refreshAndRetry(Response response) throws java.io.IOException {
        Request failed = response.request();
        String path = failed.url().encodedPath();
        if (response.priorResponse() != null || path.endsWith("/auth/refresh/")
                || path.endsWith("/auth/login/") || path.endsWith("/auth/logout/")) {
            return null; // already retried, or the auth calls themselves failed
        }
        String host = failed.url().host();
        TokenUsed used = failed.tag(TokenUsed.class);
        synchronized (refreshLock) {
            // Refresh tokens rotate (the old one stops working), so only one thread refreshes;
            // the others see the new access token and just retry.
            String current = cookieValue(host, "access_token");
            boolean alreadyRefreshed = current != null && (used == null || !current.equals(used.value));
            if (!alreadyRefreshed) {
                Request refresh = new Request.Builder()
                        .url(failed.url().resolve("/api/auth/refresh/"))
                        .post(RequestBody.create(new byte[0]))
                        .build();
                try (Response r = httpClient.newCall(refresh).execute()) {
                    if (!r.isSuccessful()) return null; // refresh expired too: the screen sees the 401
                }
            }
        }
        return failed; // OkHttp adds the cookies again, now with the new access token
    }

    private static final class TokenUsed {
        final String value;
        TokenUsed(String value) { this.value = value; }
    }

    // Force rebuild on next call (e.g. after changing server URL)
    public static void reset() {
        apiService = null;
        currentBaseUrl = null;
        clearCookies();
    }
}