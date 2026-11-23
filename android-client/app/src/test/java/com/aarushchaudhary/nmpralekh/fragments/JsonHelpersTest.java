package com.aarushchaudhary.nmpralekh.fragments;

import static org.junit.Assert.assertEquals;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.Test;

/** Record screens read server JSON through these; missing or null fields must not crash a list. */
public class JsonHelpersTest {

    private static final JsonObject RECORD = JsonParser.parseString(
            "{\"id\": 7, \"title\": \"Paper\", \"doi\": null, \"year\": \"2026\"}").getAsJsonObject();

    @Test
    public void readsStringsAndNumbers() {
        assertEquals("Paper", BaseRecordFragment.jsonStr(RECORD, "title"));
        assertEquals("7", BaseRecordFragment.jsonStr(RECORD, "id"));
        assertEquals(7, BaseRecordFragment.jsonInt(RECORD, "id"));
        assertEquals(2026, BaseRecordFragment.jsonInt(RECORD, "year"));
    }

    @Test
    public void nullMissingOrNoObjectGiveEmptyOrZero() {
        assertEquals("", BaseRecordFragment.jsonStr(RECORD, "doi"));
        assertEquals("", BaseRecordFragment.jsonStr(RECORD, "missing"));
        assertEquals("", BaseRecordFragment.jsonStr(null, "title"));
        assertEquals(0, BaseRecordFragment.jsonInt(RECORD, "doi"));
        assertEquals(0, BaseRecordFragment.jsonInt(RECORD, "missing"));
        assertEquals(0, BaseRecordFragment.jsonInt(null, "id"));
    }
}
