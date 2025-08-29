package com.a.portnet_back.DTO;

import java.util.ArrayList;
import java.util.List;

public class BulkReassignResponse {
    private int updated;
    private List<String> notFound = new ArrayList<>();

    public int getUpdated() { return updated; }
    public void setUpdated(int updated) { this.updated = updated; }
    public List<String> getNotFound() { return notFound; }
    public void setNotFound(List<String> notFound) { this.notFound = notFound; }
}
