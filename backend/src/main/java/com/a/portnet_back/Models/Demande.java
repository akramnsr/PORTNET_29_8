package com.a.portnet_back.Models;

import com.a.portnet_back.Enum.Categorie;
import com.a.portnet_back.Enum.StatusDemande;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes")
public class Demande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_enregistrement", unique = true, nullable = false)
    private String numeroEnregistrement;

    @Enumerated(EnumType.STRING)
    private StatusDemande statut;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categorie categorie;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @ManyToOne
    @JoinColumn(name = "bureau_douanier_id")
    private BureauDouanier bureauDouanier;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "devise_id")
    private Devise devise;


    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Marchandise> marchandises = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "importateur_id")
    private Importateur importateur;


    public Demande() {
    }

    public Demande(String numeroEnregistrement, Categorie categorie, Importateur importateur) {
        this.numeroEnregistrement = numeroEnregistrement;
        this.categorie = categorie;
        this.importateur = importateur;
        this.statut = StatusDemande.EN_ATTENTE;
        this.dateCreation = LocalDateTime.now();
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroEnregistrement() {
        return numeroEnregistrement;
    }

    public void setNumeroEnregistrement(String numeroEnregistrement) {
        this.numeroEnregistrement = numeroEnregistrement;
    }

    public StatusDemande getStatut() {
        return statut;
    }

    public void setStatut(StatusDemande statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public BureauDouanier getBureauDouanier() {
        return bureauDouanier;
    }

    public void setBureauDouanier(BureauDouanier bureauDouanier) {
        this.bureauDouanier = bureauDouanier;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
        if (documents != null) {
            for (Document doc : documents) {
                doc.setDemande(this);
            }
        }
    }

    public Devise getDevise() {
        return devise;
    }

    public void setDevise(Devise devise) {
        this.devise = devise;
    }


    public List<Marchandise> getMarchandises() {
        return marchandises;
    }

    public void setMarchandises(List<Marchandise> marchandises) {
        this.marchandises = marchandises;
        if (marchandises != null) {
            for (Marchandise marchandise : marchandises) {
                marchandise.setDemande(this);
            }
        }
    }

    public Importateur getImportateur() {
        return importateur;
    }

    public void setImportateur(Importateur importateur) {
        this.importateur = importateur;
    }



    public void addDocument(Document document) {
        documents.add(document);
        document.setDemande(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setDemande(null);
    }


    public void addMarchandise(Marchandise marchandise) {
        marchandises.add(marchandise);
        marchandise.setDemande(this);
    }


    public void removeMarchandise(Marchandise marchandise) {
        marchandises.remove(marchandise);
        marchandise.setDemande(null);
    }


    public int getNombreMarchandises() {
        return marchandises != null ? marchandises.size() : 0;
    }


    public Double getMontantTotal() {
        if (marchandises == null || marchandises.isEmpty()) {
            return 0.0;
        }
        return marchandises.stream()
                .mapToDouble(m -> m.getMontant() != null ? m.getMontant() : 0.0)
                .sum();
    }


    public Double getQuantiteTotale() {
        if (marchandises == null || marchandises.isEmpty()) {
            return 0.0;
        }
        return marchandises.stream()
                .mapToDouble(m -> m.getQuantite() != null ? m.getQuantite() : 0.0)
                .sum();
    }


    public List<String> getDesignationsMarchandises() {
        if (marchandises == null || marchandises.isEmpty()) {
            return new ArrayList<>();
        }
        return marchandises.stream()
                .map(Marchandise::getDesignation)
                .filter(designation -> designation != null && !designation.trim().isEmpty())
                .toList();
    }



    public boolean isModifiable() {
        return statut == StatusDemande.EN_ATTENTE;
    }

    public void markAsModified() {
        this.dateModification = LocalDateTime.now();
    }

    public String getNomImportateur() {
        return importateur != null ? importateur.getNomComplet() : null;
    }

    public String getSocieteImportateur() {
        return importateur != null ? importateur.getSociete() : null;
    }


    public boolean isComplete() {
        return marchandises != null && !marchandises.isEmpty() &&
                importateur != null &&
                categorie != null &&
                numeroEnregistrement != null && !numeroEnregistrement.trim().isEmpty();
    }

    @Override
    public String toString() {
        return "Demande{" +
                "id=" + id +
                ", numeroEnregistrement='" + numeroEnregistrement + '\'' +
                ", statut=" + statut +
                ", categorie=" + categorie +
                ", dateCreation=" + dateCreation +
                ", nombreMarchandises=" + getNombreMarchandises() +
                ", montantTotal=" + getMontantTotal() +
                '}';
    }
}