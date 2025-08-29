package com.a.portnet_back.DTO;

import java.util.List;

public class BulkReassignRequest {
    private List<String> dossierIds;
    private Long targetAgentId;
    private String reason;

    public List<String> getDossierIds() { return dossierIds; }
    public void setDossierIds(List<String> dossierIds) { this.dossierIds = dossierIds; }
    public Long getTargetAgentId() { return targetAgentId; }
    public void setTargetAgentId(Long targetAgentId) { this.targetAgentId = targetAgentId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
