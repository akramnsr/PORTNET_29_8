package com.a.portnet_back.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_original", nullable = false)
    private String nom;

    @Column(name = "chemin_s3", nullable = false)
    private String chemin; // dans cloud {importateurId}/{categorie}/{numeroEnregistrement}/{filename}

    @Column(name = "type_mime")
    private String type;

    @Column(name = "taille_fichier")
    private Long taille;

    @Column(name = "date_upload", nullable = false)
    private LocalDateTime dateUpload = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;


    public Document() {}

    public Document(String nom, String chemin, String type, Long taille, Demande demande) {
        this.nom = nom;
        this.chemin = chemin;
        this.type = type;
        this.taille = taille;
        this.demande = demande;
        this.dateUpload = LocalDateTime.now();
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

    public String getChemin() {
        return chemin;
    }

    public void setChemin(String chemin) {
        this.chemin = chemin;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getTaille() {
        return taille;
    }

    public void setTaille(Long taille) {
        this.taille = taille;
    }

    public LocalDateTime getDateUpload() {
        return dateUpload;
    }

    public void setDateUpload(LocalDateTime dateUpload) {
        this.dateUpload = dateUpload;
    }

    public Demande getDemande() {
        return demande;
    }

    public void setDemande(Demande demande) {
        this.demande = demande;
    }


    public String getTailleFormatee() {
        if (taille == null) return "N/A";

        if (taille < 1024) return taille + " B";
        if (taille < 1024 * 1024) return String.format("%.1f KB", taille / 1024.0);
        return String.format("%.1f MB", taille / (1024.0 * 1024.0));
    }

    public String getExtension() {
        if (nom == null || !nom.contains(".")) return "";
        return nom.substring(nom.lastIndexOf(".") + 1).toLowerCase();
    }

    @Override
    public String toString() {
        return "Document{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", type='" + type + '\'' +
                ", taille=" + getTailleFormatee() +
                ", dateUpload=" + dateUpload +
                '}';
    }
}