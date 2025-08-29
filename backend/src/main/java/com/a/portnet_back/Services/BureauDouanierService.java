package com.a.portnet_back.Services;

import com.a.portnet_back.Models.BureauDouanier;
import com.a.portnet_back.Repositories.BureauDouanierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BureauDouanierService {

    private final BureauDouanierRepository bureauDouanierRepository;

    public BureauDouanierService(BureauDouanierRepository bureauDouanierRepository) {
        this.bureauDouanierRepository = bureauDouanierRepository;
    }


    public BureauDouanier getBureauById(Long id) {
        return bureauDouanierRepository.findById(id).orElse(null);
    }


    public List<BureauDouanier> getAllBureaux() {
        return bureauDouanierRepository.findAll();
    }

    public BureauDouanier getBureauByCode(String code) {
        return bureauDouanierRepository.findByCode(code).orElse(null);
    }


    public List<BureauDouanier> searchBureaux(String searchTerm) {
        return bureauDouanierRepository.findByDescriptionContainingIgnoreCase(searchTerm);
    }
}