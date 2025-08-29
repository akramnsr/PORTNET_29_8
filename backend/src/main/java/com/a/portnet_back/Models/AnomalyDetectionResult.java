package com.a.portnet_back.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly_detection_results")
public class AnomalyDetectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id")
    private AgentActivityLog log;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = true)
    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime detectedAt;


    public AnomalyDetectionResult() {
        this.detectedAt = LocalDateTime.now();
        this.confidence = 0.0;
    }


    public AnomalyDetectionResult(Agent agent, AgentActivityLog log, String type,
                                  String severity, Double confidence, String description) {
        this.agent = agent;
        this.log = log;
        this.type = type;
        this.severity = severity;
        this.confidence = (confidence != null) ? confidence : 0.0;
        this.description = description;
        this.detectedAt = LocalDateTime.now();
        this.message = String.format("[%s] %s (confidence: %.2f)", severity, description, this.confidence);
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public AgentActivityLog getLog() {
        return log;
    }

    public void setLog(AgentActivityLog log) {
        this.log = log;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}
