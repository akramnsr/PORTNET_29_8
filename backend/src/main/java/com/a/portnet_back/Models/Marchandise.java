package com.a.portnet_back.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "marchandise")
public class Marchandise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "designation", nullable = false)
    private String designation;

    @Column(name = "quantite")
    private Double quantite;

    @Column(name = "montant")
    private Double montant;

    @Column(name = "code_sh")
    private String codeSh;

    @Column(name = "unite_mesure")
    private String uniteMesure;

    @Column(name = "poids_net")
    private Double poidsNet;

    @Column(name = "poids_brut")
    private Double poidsBrut;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;


    @ManyToOne
    @JoinColumn(name = "pays_id")
    private Pays pays;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;


    public Marchandise() {}

    public Marchandise(String designation, Double quantite, Double montant, String codeSh) {
        this.designation = designation;
        this.quantite = quantite;
        this.montant = montant;
        this.codeSh = codeSh;
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Double getQuantite() {
        return quantite;
    }

    public void setQuantite(Double quantite) {
        this.quantite = quantite;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getCodeSh() {
        return codeSh;
    }

    public void setCodeSh(String codeSh) {
        this.codeSh = codeSh;
    }

    public String getUniteMesure() {
        return uniteMesure;
    }

    public void setUniteMesure(String uniteMesure) {
        this.uniteMesure = uniteMesure;
    }

    public Double getPoidsNet() {
        return poidsNet;
    }

    public void setPoidsNet(Double poidsNet) {
        this.poidsNet = poidsNet;
    }

    public Double getPoidsBrut() {
        return poidsBrut;
    }

    public void setPoidsBrut(Double poidsBrut) {
        this.poidsBrut = poidsBrut;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Pays getPays() {
        return pays;
    }

    public void setPays(Pays pays) {
        this.pays = pays;
    }

    public Demande getDemande() {
        return demande;
    }

    public void setDemande(Demande demande) {
        this.demande = demande;
    }


    public Double getValeurUnitaire() {
        if (quantite != null && quantite > 0 && montant != null) {
            return montant / quantite;
        }
        return null;
    }


    public String getNumeroDemande() {
        return demande != null ? demande.getNumeroEnregistrement() : null;
    }


    public boolean isValide() {
        return designation != null && !designation.trim().isEmpty() &&
                quantite != null && quantite > 0 &&
                montant != null && montant > 0 &&
                codeSh != null && !codeSh.trim().isEmpty();
    }


    public String getMontantFormate() {
        if (montant == null) return "N/A";

        String deviseCode = "MAD"; // Devise par défaut
        if (demande != null && demande.getDevise() != null) {
            deviseCode = demande.getDevise().getCode();
        }

        return String.format("%.2f %s", montant, deviseCode);
    }


    public String getQuantiteFormatee() {
        if (quantite == null) return "N/A";

        String unite = uniteMesure != null ? uniteMesure : "unité(s)";
        return String.format("%.2f %s", quantite, unite);
    }

    @Override
    public String toString() {
        return "Marchandise{" +
                "id=" + id +
                ", designation='" + designation + '\'' +
                ", quantite=" + quantite +
                ", montant=" + montant +
                ", codeSh='" + codeSh + '\'' +
                ", uniteMesure='" + uniteMesure + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Marchandise that = (Marchandise) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}