package com.aarushchaudhary.nmpralekh.api;

import com.google.gson.JsonObject;
import java.util.List;
import java.util.Map;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {
    // Auth
    @POST("api/auth/login/")
    Call<JsonObject> login(@Body JsonObject credentials);

    @POST("api/auth/refresh/")
    Call<JsonObject> refreshToken();

    @POST("api/auth/logout/")
    Call<JsonObject> logout();

    @GET("api/auth/me/")
    Call<JsonObject> getMe();

    // Dashboard
    @GET("api/records/dashboard-counts/")
    Call<JsonObject> getDashboardCounts();

    @GET("api/schools/my-schools/")
    Call<List<JsonObject>> getMySchools();

    // School Activities
    @GET("api/records/school-activities/")
    Call<JsonObject> getSchoolActivities(@QueryMap Map<String, String> params);

    @POST("api/records/school-activities/")
    Call<JsonObject> createSchoolActivity(@Body JsonObject body);

    @PUT("api/records/school-activities/{id}/")
    Call<JsonObject> updateSchoolActivity(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/school-activities/{id}/")
    Call<JsonObject> deleteSchoolActivity(@Path("id") int id);

    // Student Activities
    @GET("api/records/student-activities/")
    Call<JsonObject> getStudentActivities(@QueryMap Map<String, String> params);

    @POST("api/records/student-activities/")
    Call<JsonObject> createStudentActivity(@Body JsonObject body);

    @PUT("api/records/student-activities/{id}/")
    Call<JsonObject> updateStudentActivity(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/student-activities/{id}/")
    Call<JsonObject> deleteStudentActivity(@Path("id") int id);

    // Clubs (for student activities)
    @GET("api/records/clubs/")
    Call<JsonObject> getClubs(@QueryMap Map<String, String> params);

    // FDP
    @GET("api/records/fdp/")
    Call<JsonObject> getFdp(@QueryMap Map<String, String> params);

    @POST("api/records/fdp/")
    Call<JsonObject> createFdp(@Body JsonObject body);

    @PUT("api/records/fdp/{id}/")
    Call<JsonObject> updateFdp(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/fdp/{id}/")
    Call<JsonObject> deleteFdp(@Path("id") int id);

    // Placements
    @GET("api/records/placements/")
    Call<JsonObject> getPlacements(@QueryMap Map<String, String> params);

    @POST("api/records/placements/")
    Call<JsonObject> createPlacement(@Body JsonObject body);

    @PUT("api/records/placements/{id}/")
    Call<JsonObject> updatePlacement(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/placements/{id}/")
    Call<JsonObject> deletePlacement(@Path("id") int id);

    // Publications
    @GET("api/records/publications/")
    Call<JsonObject> getPublications(@QueryMap Map<String, String> params);

    @POST("api/records/publications/")
    Call<JsonObject> createPublication(@Body JsonObject body);

    @PUT("api/records/publications/{id}/")
    Call<JsonObject> updatePublication(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/publications/{id}/")
    Call<JsonObject> deletePublication(@Path("id") int id);

    // Publication authors
    @GET("api/records/publications/{id}/authors/")
    Call<JsonObject> getPublicationAuthors(@Path("id") int id);

    @POST("api/records/publications/{id}/authors/")
    Call<JsonObject> addPublicationAuthor(@Path("id") int id, @Body JsonObject body);

    // Patents
    @GET("api/records/patents/")
    Call<JsonObject> getPatents(@QueryMap Map<String, String> params);

    @POST("api/records/patents/")
    Call<JsonObject> createPatent(@Body JsonObject body);

    @PUT("api/records/patents/{id}/")
    Call<JsonObject> updatePatent(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/patents/{id}/")
    Call<JsonObject> deletePatent(@Path("id") int id);

    // Patent applicants
    @GET("api/records/patents/{id}/applicants/")
    Call<JsonObject> getPatentApplicants(@Path("id") int id);

    @POST("api/records/patents/{id}/applicants/")
    Call<JsonObject> addPatentApplicant(@Path("id") int id, @Body JsonObject body);

    // Certifications
    @GET("api/records/certifications/")
    Call<JsonObject> getCertifications(@QueryMap Map<String, String> params);

    @POST("api/records/certifications/")
    Call<JsonObject> createCertification(@Body JsonObject body);

    @PUT("api/records/certifications/{id}/")
    Call<JsonObject> updateCertification(@Path("id") int id, @Body JsonObject body);

    @DELETE("api/records/certifications/{id}/")
    Call<JsonObject> deleteCertification(@Path("id") int id);

    // Faculty User Search
    @GET("api/records/faculty-users/")
    Call<com.google.gson.JsonArray> searchFaculty(@Query("search") String query);

    // Export
    @GET("api/export/all/")
    @Streaming
    Call<ResponseBody> exportAll();
}
