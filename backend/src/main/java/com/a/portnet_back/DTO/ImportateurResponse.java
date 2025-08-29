package com.a.portnet_back.DTO;

public class ImportateurResponse {
    private Long id;
    private String nomComplet;
    private String email;
    private String societe;
    private String telephone;
    private String ville;
    private String pays;
    private String domaineActivite;
    private String typeOperation;


    public ImportateurResponse() {}

    public ImportateurResponse(Long id, String nomComplet, String email) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.email = email;
    }

    public ImportateurResponse(Long id, String nomComplet, String email, String societe, String telephone) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.email = email;
        this.societe = societe;
        this.telephone = telephone;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSociete() { return societe; }
    public void setSociete(String societe) { this.societe = societe; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public String getDomaineActivite() { return domaineActivite; }
    public void setDomaineActivite(String domaineActivite) { this.domaineActivite = domaineActivite; }

    public String getTypeOperation() { return typeOperation; }
    public void setTypeOperation(String typeOperation) { this.typeOperation = typeOperation; }
}