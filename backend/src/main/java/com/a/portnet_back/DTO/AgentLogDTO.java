package com.a.portnet_back.DTO;

import java.time.LocalDateTime;

public class AgentLogDTO {
    private Long id;
    private String nomComplet;
    private String email;
    private String departement;
    private boolean enabled;
    private LocalDateTime lastLogin;
    private String activityType;
    private String ipAddress;
    private String deviceInfo;
    private String browserInfo;
    private boolean success;
    private String sessionId;
    private Integer durationSeconds;
    private String location;


    public AgentLogDTO() {}


    public AgentLogDTO(Long id, String nomComplet, String email, boolean enabled, LocalDateTime lastLogin) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.email = email;
        this.enabled = enabled;
        this.lastLogin = lastLogin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartement() {
        return departement;
    }

    public void setDepartement(String departement) {
        this.departement = departement;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getBrowserInfo() {
        return browserInfo;
    }

    public void setBrowserInfo(String browserInfo) {
        this.browserInfo = browserInfo;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    @Override
    public String toString() {
        return "AgentLogDTO{" +
                "id=" + id +
                ", nomComplet='" + nomComplet + '\'' +
                ", email='" + email + '\'' +
                ", departement='" + departement + '\'' +
                ", enabled=" + enabled +
                ", lastLogin=" + lastLogin +
                ", activityType='" + activityType + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", success=" + success +
                '}';
    }
}