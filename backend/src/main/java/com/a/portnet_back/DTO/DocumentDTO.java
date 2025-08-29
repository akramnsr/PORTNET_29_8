package com.a.portnet_back.DTO;

public class DocumentDTO {
    private Long id;
    private String nom;
    private String type;
    private String chemin;

    public DocumentDTO(Long id, String nom, String type, String chemin) {
        this.id = id;
        this.nom = nom;
        this.type = type;
        this.chemin = chemin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getChemin() {
        return chemin;
    }

    public void setChemin(String chemin) {
        this.chemin = chemin;
    }
}
