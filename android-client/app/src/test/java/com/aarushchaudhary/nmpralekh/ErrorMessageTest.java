package com.aarushchaudhary.nmpralekh;

import static org.junit.Assert.assertEquals;

import okhttp3.MediaType;
import okhttp3.ResponseBody;

import org.junit.Test;

/** Turning a Django REST error response into the text shown under a form. */
public class ErrorMessageTest {

    private static String messageFor(int code, String body, String type) {
        return BaseAuthActivity.errorMessage(
                retrofit2.Response.error(code, ResponseBody.create(body, MediaType.get(type))));
    }

    private static String messageFor(int code, String json) {
        return messageFor(code, json, "application/json");
    }

    @Test
    public void everyFieldMessageIsShownOnItsOwnLine() {
        assertEquals("This password is too short.\nThis password is too common.",
                messageFor(400, "{\"new_password\": [\"This password is too short.\", \"This password is too common.\"]}"));
    }

    @Test
    public void aDetailMessageIsShownAsIs() {
        assertEquals("Incorrect password.", messageFor(403, "{\"detail\": \"Incorrect password.\"}"));
    }

    @Test
    public void messagesFromSeveralFieldsAreAllShown() {
        assertEquals("Your current password is incorrect.\nToo similar to the username.",
                messageFor(400, "{\"current_password\": [\"Your current password is incorrect.\"],"
                        + " \"new_password\": [\"Too similar to the username.\"]}"));
    }

    @Test
    public void anHtmlErrorPageGivesAGeneralMessageWithTheCode() {
        assertEquals("Something went wrong (error 502). Please try again.",
                messageFor(502, "<html><body>Bad Gateway</body></html>", "text/html"));
    }

    @Test
    public void anEmptyBodyGivesAGeneralMessageWithTheCode() {
        assertEquals("Something went wrong (error 500). Please try again.", messageFor(500, ""));
    }
}
