package com.a.portnet_back.DTO;

public class AgentResponse {
    private Long id;
    private String nomComplet;
    private String email;


    public AgentResponse(Long id, String nomComplet, String email) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public String getEmail() {
        return email;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
