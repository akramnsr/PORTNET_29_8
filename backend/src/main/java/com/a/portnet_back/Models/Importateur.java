package com.a.portnet_back.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "importateur")
public class Importateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomComplet;
    private String societe;
    private String telephone;
    private String adresse;
    private String ville;
    private String pays;
    private String rc;
    private String ice;
    private String ifiscale;
    private String patente;
    private String emailProfessionnel;

    private String domaineActivite;
    private String typeOperation;

    private boolean certifieISO;
    private String statutDouanier;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;


    public Importateur() {}

    public Importateur(String nomComplet, String societe, String telephone, User user) {
        this.nomComplet = nomComplet;
        this.societe = societe;
        this.telephone = telephone;
        this.user = user;
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

    public String getSociete() {
        return societe;
    }

    public void setSociete(String societe) {
        this.societe = societe;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getRc() {
        return rc;
    }

    public void setRc(String rc) {
        this.rc = rc;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }

    public String getIfiscale() {
        return ifiscale;
    }

    public void setIfiscale(String ifiscale) {
        this.ifiscale = ifiscale;
    }

    public String getPatente() {
        return patente;
    }

    public void setPatente(String patente) {
        this.patente = patente;
    }

    public String getEmailProfessionnel() {
        return emailProfessionnel;
    }

    public void setEmailProfessionnel(String emailProfessionnel) {
        this.emailProfessionnel = emailProfessionnel;
    }

    public String getDomaineActivite() {
        return domaineActivite;
    }

    public void setDomaineActivite(String domaineActivite) {
        this.domaineActivite = domaineActivite;
    }

    public String getTypeOperation() {
        return typeOperation;
    }

    public void setTypeOperation(String typeOperation) {
        this.typeOperation = typeOperation;
    }

    public boolean isCertifieISO() {
        return certifieISO;
    }

    public void setCertifieISO(boolean certifieISO) {
        this.certifieISO = certifieISO;
    }

    public String getStatutDouanier() {
        return statutDouanier;
    }

    public void setStatutDouanier(String statutDouanier) {
        this.statutDouanier = statutDouanier;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}