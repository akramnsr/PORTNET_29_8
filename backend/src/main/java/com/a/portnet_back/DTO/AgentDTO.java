package com.a.portnet_back.DTO;

import java.time.LocalDateTime;

public class AgentDTO {
    private Long id;
    private String nomComplet;
    private String email;
    private boolean enabled;        // état du compte User (true = activé/débloqué)
    private LocalDateTime lastLogin;

    public AgentDTO() {
    }

    public AgentDTO(Long id, String nomComplet, String email, boolean enabled, LocalDateTime lastLogin) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.email = email;
        this.enabled = enabled;
        this.lastLogin = lastLogin;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
