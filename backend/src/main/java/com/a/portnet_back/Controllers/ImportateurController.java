package com.a.portnet_back.Controllers;

import com.a.portnet_back.DTO.ImportateurRequestDTO;
import com.a.portnet_back.DTO.ImportateurResponse;
import com.a.portnet_back.Models.Importateur;
import com.a.portnet_back.Services.ImportateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/importateur")
@CrossOrigin(origins = "http://localhost:3000")
public class ImportateurController {

    private final ImportateurService importateurService;

    public ImportateurController(ImportateurService importateurService) {
        this.importateurService = importateurService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerImportateur(@RequestBody ImportateurRequestDTO dto) {
        try {
            Importateur importateur = importateurService.enregistrerImportateur(dto);

            ImportateurResponse response = new ImportateurResponse(
                    importateur.getId(),
                    importateur.getNomComplet(),
                    importateur.getUser().getEmail(),
                    importateur.getSociete(),
                    importateur.getTelephone()
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de l'inscription: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('IMPORTATEUR')")
    public ResponseEntity<?> getProfile() {
        try {
            Importateur importateur = importateurService.getImportateurConnecte();

            ImportateurResponse response = new ImportateurResponse();
            response.setId(importateur.getId());
            response.setNomComplet(importateur.getNomComplet());
            response.setEmail(importateur.getUser().getEmail());
            response.setSociete(importateur.getSociete());
            response.setTelephone(importateur.getTelephone());
            response.setVille(importateur.getVille());
            response.setPays(importateur.getPays());
            response.setDomaineActivite(importateur.getDomaineActivite());
            response.setTypeOperation(importateur.getTypeOperation());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Profil importateur non trouvé: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<List<Importateur>> getAllImportateurs() {
        try {
            List<Importateur> importateurs = importateurService.getAllImportateurs();
            return ResponseEntity.ok(importateurs);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<?> getImportateurById(@PathVariable Long id) {
        try {
            Importateur importateur = importateurService.findById(id);
            return ResponseEntity.ok(importateur);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Importateur non trouvé");
        }
    }
}