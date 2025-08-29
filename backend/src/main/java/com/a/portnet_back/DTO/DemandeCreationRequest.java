package com.a.portnet_back.DTO;

import com.a.portnet_back.Enum.Categorie;
import org.springframework.web.multipart.MultipartFile;

public class DemandeCreationRequest {

    private Categorie categorie;
    private Long bureauDouanierId;
    private Long deviseId;
    private MarchandiseDTO marchandise;
    private MultipartFile[] documents;

    public Categorie getCategorie() {
        return categorie;
    }
    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public Long getBureauDouanierId() {
        return bureauDouanierId;
    }
    public void setBureauDouanierId(Long bureauDouanierId) {
        this.bureauDouanierId = bureauDouanierId;
    }

    public Long getDeviseId() {
        return deviseId;
    }
    public void setDeviseId(Long deviseId) {
        this.deviseId = deviseId;
    }

    public MarchandiseDTO getMarchandise() {
        return marchandise;
    }
    public void setMarchandise(MarchandiseDTO marchandise) {
        this.marchandise = marchandise;
    }

    public MultipartFile[] getDocuments() {
        return documents;
    }
    public void setDocuments(MultipartFile[] documents) {
        this.documents = documents;
    }


    public static class MarchandiseDTO {
        private String designation;
        private Double quantite;
        private Double montant;
        private String codeSh;
        private Long paysId;

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

        public Long getPaysId() {
            return paysId;
        }
        public void setPaysId(Long paysId) {
            this.paysId = paysId;
        }
    }
}
