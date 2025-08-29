package com.a.portnet_back.Controllers;

import com.a.portnet_back.DTO.AgentActivationRequest;
import com.a.portnet_back.DTO.AgentDTO;
import com.a.portnet_back.DTO.AgentRequest;
import com.a.portnet_back.Services.AgentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

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
            agentService.deleteAgent(id); // pas d'affectation : la méthode est void
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            // ex. "Agent non trouvé"
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression : " + e.getMessage());
        }
    }

}
