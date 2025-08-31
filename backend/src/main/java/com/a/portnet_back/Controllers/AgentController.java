package com.a.portnet_back.Controllers;

import com.a.portnet_back.DTO.AgentActivationRequest;
import com.a.portnet_back.DTO.AgentDTO;
import com.a.portnet_back.DTO.AgentRequest;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.User;
import com.a.portnet_back.Repositories.UserRepository;
import com.a.portnet_back.Services.AgentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;
    private final UserRepository userRepository;

    public AgentController(AgentService agentService, UserRepository userRepository) {
        this.agentService = agentService;
        this.userRepository = userRepository;
    }

    /* ----------------------------------------------------------------------
       CRUD & activation (inchangés)
     ---------------------------------------------------------------------- */

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SUPERVISEUR')")
    public ResponseEntity<?> createAgent(@RequestBody AgentRequest request, Principal principal) {
        try {
            if (request == null || request.getEmail() == null || request.getEmail().isBlank()
                    || request.getNomComplet() == null || request.getNomComplet().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Nom complet et email sont obligatoires");
            }
            Long superviseurId = 1L; // à adapter si tu relies réellement le principal
            agentService.createAgent(request, superviseurId);
            return ResponseEntity.ok("Agent créé avec succès. Email d'activation envoyé.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors de la création : " + e.getMessage());
        }
    }

    @PostMapping("/activation")
    public ResponseEntity<?> activateAgent(@RequestBody AgentActivationRequest request) {
        try {
            boolean success = agentService.activateAgent(request);
            if (success) return ResponseEntity.ok("Compte activé avec succès. Vous pouvez vous connecter.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token invalide ou expiré.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur lors de l'activation.");
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPERVISEUR') or hasAuthority('ROLE_AGENT')")
    public ResponseEntity<List<AgentDTO>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @PostMapping("/{id}/toggle-activation")
    @PreAuthorize("hasAuthority('ROLE_SUPERVISEUR')")
    public ResponseEntity<?> toggleActivation(@PathVariable Long id) {
        try {
            boolean newState = agentService.toggleAgentActivation(id);
            return ResponseEntity.ok(java.util.Map.of("id", id, "enabled", newState));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Agent introuvable ou non activé");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SUPERVISEUR')")
    public ResponseEntity<?> deleteAgent(@PathVariable Long id) {
        try {
            agentService.deleteAgent(id);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression : " + e.getMessage());
        }
    }

    /* ----------------------------------------------------------------------
       ✅ Endpoints profil agent courant : /api/agents/me (GET + PUT)
     ---------------------------------------------------------------------- */

    /** Renvoie l'agent courant avec les champs utiles pour le front. */
    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_AGENT','ROLE_SUPERVISEUR')")
    public ResponseEntity<?> getMe(Authentication auth) {
        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            Optional<Agent> agentOpt = userOpt.flatMap(u -> agentService.findByUserId(u.getId()));
            if (agentOpt.isEmpty()) {
                // fallback via email si pas de liaison user_id
                agentOpt = agentService.findByEmail(email);
            }

            if (agentOpt.isEmpty()) {
                Map<String, Object> minimal = new HashMap<>();
                minimal.put("email", email);
                minimal.put("authorities", auth.getAuthorities());
                return ResponseEntity.ok(minimal);
            }

            Agent a = agentOpt.get();
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", a.getId());
            dto.put("nomComplet", a.getNomComplet());
            dto.put("email", a.getEmail());
            dto.put("telephone", a.getTelephone());
            dto.put("departement", a.getDepartement());
            dto.put("superviseur_id", a.getSuperviseurId());
            dto.put("user_id", a.getUser() != null ? a.getUser().getId() : null);
            dto.put("is_activated", a.isActivated());
            dto.put("date_creation", a.getDateCreation());
            dto.put("authorities", auth.getAuthorities());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur getMe: " + e.getMessage());
        }
    }

    /** Met à jour nom / téléphone / département de l'agent courant. */
    @PutMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_AGENT','ROLE_SUPERVISEUR')")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            Optional<Agent> agentOpt = userOpt.flatMap(u -> agentService.findByUserId(u.getId()));
            if (agentOpt.isEmpty()) {
                agentOpt = agentService.findByEmail(email);
            }
            if (agentOpt.isEmpty()) return ResponseEntity.status(404).body("Agent introuvable");

            Agent a = agentOpt.get();

            String nom = (String) body.getOrDefault("nomComplet", body.get("nom_complet"));
            String tel = (String) body.get("telephone");
            String dep = (String) body.get("departement");

            if (nom != null) a.setNomComplet(nom);
            if (tel != null) a.setTelephone(tel);
            if (dep != null) a.setDepartement(dep);

            agentService.save(a);

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", a.getId());
            dto.put("nomComplet", a.getNomComplet());
            dto.put("telephone", a.getTelephone());
            dto.put("departement", a.getDepartement());
            dto.put("superviseur_id", a.getSuperviseurId());
            dto.put("user_id", a.getUser() != null ? a.getUser().getId() : null);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur updateMe: " + e.getMessage());
        }
    }
}
