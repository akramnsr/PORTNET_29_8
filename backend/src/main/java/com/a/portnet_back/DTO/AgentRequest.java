package com.a.portnet_back.DTO;


public class AgentRequest {

    private String nomComplet;
    private String email;
    private String telephone;
    private String departement;

    public AgentRequest() {}

    public AgentRequest(String nomComplet, String email, String telephone, String departement) {
        this.nomComplet = nomComplet;
        this.email = email;
        this.telephone = telephone;
        this.departement = departement;
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

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getDepartement() {
        return departement;
    }

    public void setDepartement(String departement) {
        this.departement = departement;
    }
}
