package com.a.portnet_back.Controllers;

import com.a.portnet_back.Enum.Categorie;
import com.a.portnet_back.Models.BureauDouanier;
import com.a.portnet_back.Models.Devise;
import com.a.portnet_back.Models.Marchandise;
import com.a.portnet_back.Repositories.BureauDouanierRepository;
import com.a.portnet_back.Repositories.DeviseRepository;
import com.a.portnet_back.Repositories.MarchandiseRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReferenceDataController {

    private final BureauDouanierRepository bureauRepository;
    private final DeviseRepository deviseRepository;
    private final MarchandiseRepository marchandiseRepository;

    public ReferenceDataController(
            BureauDouanierRepository bureauRepository,
            DeviseRepository deviseRepository,
            MarchandiseRepository marchandiseRepository) {
        this.bureauRepository = bureauRepository;
        this.deviseRepository = deviseRepository;
        this.marchandiseRepository = marchandiseRepository;
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return Arrays.stream(Categorie.values())
                .map(Enum::name)
                .toList();
    }

    @GetMapping("/bureaux")
    public List<BureauDouanier> getBureaux() {
        return bureauRepository.findAll();
    }

    @GetMapping("/devises")
    public List<Devise> getDevises() {
        return deviseRepository.findAll();
    }

    @GetMapping("/marchandises")
    public List<Marchandise> getMarchandises() {
        return marchandiseRepository.findAll();
    }
}
