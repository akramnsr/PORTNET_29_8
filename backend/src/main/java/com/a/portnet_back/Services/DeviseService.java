package com.a.portnet_back.Services;

import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.Devise;
import com.a.portnet_back.Repositories.DeviseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviseService {

    private final DeviseRepository deviseRepository;

    public DeviseService(DeviseRepository deviseRepository) {
        this.deviseRepository = deviseRepository;
    }


    public Devise getDeviseById(Long id) {
        return deviseRepository.findById(id).orElse(null);
    }

    public List<Devise> getDevisesActives() {
        return deviseRepository.findByStatus(StatusDemande.ACCEPTEE);
    }


    public List<Devise> getAllDevises() {
        return deviseRepository.findAll();
    }


    public Devise getDeviseByCode(String code) {
        return deviseRepository.findByCode(code).orElse(null);
    }

    public List<Devise> searchDevises(String searchTerm) {
        return deviseRepository.findByDescriptionContainingIgnoreCase(searchTerm);
    }
}