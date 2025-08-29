package com.a.portnet_back.DTO;

import java.time.LocalDateTime;

public class DispatchLogDTO {
    private Long id;
    private LocalDateTime date;
    private String dossier;
    private String from;
    private String toAgent;
    private String by;
    private String motif;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getDossier() { return dossier; }
    public void setDossier(String dossier) { this.dossier = dossier; }
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getToAgent() { return toAgent; }
    public void setToAgent(String toAgent) { this.toAgent = toAgent; }
    public String getBy() { return by; }
    public void setBy(String by) { this.by = by; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
}
