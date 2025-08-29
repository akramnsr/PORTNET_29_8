package com.a.portnet_back.Models;
import com.a.portnet_back.Enum.StatusDemande;
import jakarta.persistence.*;

@Entity
public class Devise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String description;

    @Enumerated(EnumType.STRING)
    private StatusDemande status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StatusDemande getStatus() {
        return status;
    }

    public void setStatus(StatusDemande status) {
        this.status = status;
    }
}
