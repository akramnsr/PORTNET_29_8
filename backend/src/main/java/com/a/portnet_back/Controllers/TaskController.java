package com.a.portnet_back.Controllers;

import com.a.portnet_back.Models.TaskAssignment;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Services.TaskDispatcherService;
import com.a.portnet_back.Services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskDispatcherService dispatcher;
    private final AuthService authService;

    public TaskController(TaskDispatcherService dispatcher, AuthService authService) {
        this.dispatcher = dispatcher;
        this.authService = authService;
    }

    /** Vue agent : sa liste (assignées / en cours) */
    @GetMapping("/my")
    public ResponseEntity<?> myTasks() {
        Agent me = authService.getCurrentAgent();
        return dispatcher.getOrAssignNextForAgent(me.getId())
                .map(this::toDto)
                .map(dto -> ResponseEntity.ok(List.of(dto)))
                .orElseGet(() -> ResponseEntity.ok(Collections.emptyList()));
    }

    /** Vue agent : demander la prochaine tâche (si aucune, essaie d’en affecter une) */
    @PostMapping("/next")
    public ResponseEntity<?> nextTask() {
        Agent me = authService.getCurrentAgent();
        return dispatcher.getOrAssignNextForAgent(me.getId())
                .map(a -> ResponseEntity.ok(toDto(a)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Vue superviseur : dispatcher une demande en attente vers le “meilleur” agent. */
    @PostMapping("/dispatch")
    public ResponseEntity<?> dispatch() {
        return dispatcher.assignNextPendingToBestAgent()
                .map(a -> ResponseEntity.ok(toDto(a)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    private Map<String, Object> toDto(TaskAssignment ta) {
        Map<String, Object> m = new HashMap<>();
        m.put("assignmentId", ta.getId());
        m.put("status", ta.getStatus().name());
        m.put("createdAt", ta.getCreatedAt());
        m.put("agent", Map.of(
                "id", ta.getAgent().getId(),
                "nom", ta.getAgent().getNomComplet(),
                "email", ta.getAgent().getEmail()
        ));
        m.put("demande", Map.of(
                "id", ta.getDemande().getId(),
                "numero", ta.getDemande().getNumeroEnregistrement(),
                "statut", ta.getDemande().getStatut().name(),
                "dateCreation", ta.getDemande().getDateCreation()
        ));
        return m;
    }
}
