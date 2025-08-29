package com.a.portnet_back.DTO;

public class ImportateurRequestDTO {
    public String email;
    public String password;
    public String nomComplet;
    public String societe;
    public String telephone;
    public String adresse;
    public String ville;
    public String pays;
    public String rc;
    public String ice;
    public String ifiscale;
    public String patente;
    public String emailProfessionnel;
    public String domaineActivite;
    public String typeOperation;
    public boolean certifieISO;
    public String statutDouanier;


    public ImportateurRequestDTO() {}

    public ImportateurRequestDTO(String email, String password, String nomComplet, String societe) {
        this.email = email;
        this.password = password;
        this.nomComplet = nomComplet;
        this.societe = societe;
    }


    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getSociete() { return societe; }
    public void setSociete(String societe) { this.societe = societe; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public String getRc() { return rc; }
    public void setRc(String rc) { this.rc = rc; }

    public String getIce() { return ice; }
    public void setIce(String ice) { this.ice = ice; }

    public String getIfiscale() { return ifiscale; }
    public void setIfiscale(String ifiscale) { this.ifiscale = ifiscale; }

    public String getPatente() { return patente; }
    public void setPatente(String patente) { this.patente = patente; }

    public String getEmailProfessionnel() { return emailProfessionnel; }
    public void setEmailProfessionnel(String emailProfessionnel) { this.emailProfessionnel = emailProfessionnel; }

    public String getDomaineActivite() { return domaineActivite; }
    public void setDomaineActivite(String domaineActivite) { this.domaineActivite = domaineActivite; }

    public String getTypeOperation() { return typeOperation; }
    public void setTypeOperation(String typeOperation) { this.typeOperation = typeOperation; }

    public boolean isCertifieISO() { return certifieISO; }
    public void setCertifieISO(boolean certifieISO) { this.certifieISO = certifieISO; }

    public String getStatutDouanier() { return statutDouanier; }
    public void setStatutDouanier(String statutDouanier) { this.statutDouanier = statutDouanier; }
}