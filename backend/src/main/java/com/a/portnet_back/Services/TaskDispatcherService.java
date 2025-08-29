package com.a.portnet_back.Services;

import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.Demande;
import com.a.portnet_back.Models.TaskAssignment;
import com.a.portnet_back.Repositories.AgentActivityLogRepository;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Repositories.AnomalyDetectionResultRepository;
import com.a.portnet_back.Repositories.DemandeRepository;
import com.a.portnet_back.Repositories.TaskAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskDispatcherService {

    private final DemandeRepository demandeRepo;
    private final AgentRepository agentRepo;
    private final TaskAssignmentRepository assignmentRepo;
    private final AgentActivityLogRepository logRepo;
    private final AnomalyDetectionResultRepository anomalyRepo;

    public TaskDispatcherService(DemandeRepository d,
                                 AgentRepository a,
                                 TaskAssignmentRepository ta,
                                 AgentActivityLogRepository logs,
                                 AnomalyDetectionResultRepository anomalies) {
        this.demandeRepo = d;
        this.agentRepo = a;
        this.assignmentRepo = ta;
        this.logRepo = logs;
        this.anomalyRepo = anomalies;
    }

    /** Appelé automatiquement à la soumission ou à la demande (“donne-moi la prochaine tâche”). */
    @Transactional
    public Optional<TaskAssignment> assignNextPendingToBestAgent() {
        List<Demande> candidates = demandeRepo.findOldestPendingDemandes();
        for (Demande d : candidates) {
            if (assignmentRepo.findByDemandeId(d.getId()).isEmpty()) {
                Optional<Agent> best = pickBestAgent();
                if (best.isPresent()) {
                    TaskAssignment ta = new TaskAssignment();
                    ta.setAgent(best.get());
                    ta.setDemande(d);
                    ta.setStatus(TaskAssignment.Status.ASSIGNED);
                    TaskAssignment saved = assignmentRepo.save(ta);
                    // ✅ recharger en EAGER
                    return assignmentRepo.findByIdEager(saved.getId());
                }
            }
        }
        return Optional.empty();
    }

    /** Pour un agent connecté : renvoie une tâche déjà à lui, sinon lui assigne la plus vieille. */
    @Transactional
    public Optional<TaskAssignment> getOrAssignNextForAgent(Long agentId) {
        // ✅ charger en EAGER pour que agent/demande soient prêts pour le DTO
        List<TaskAssignment> mine = assignmentRepo
                .findEagerByAgentIdAndStatusInOrderByCreatedAtAsc(
                        agentId,
                        List.of(TaskAssignment.Status.ASSIGNED, TaskAssignment.Status.IN_PROGRESS)
                );
        if (!mine.isEmpty()) return Optional.of(mine.get(0));

        if (hasRecentCriticalAnomaly(agentId)) return Optional.empty();

        List<Demande> pending = demandeRepo.findOldestPendingDemandes();
        for (Demande d : pending) {
            if (assignmentRepo.findByDemandeId(d.getId()).isEmpty()) {
                TaskAssignment ta = new TaskAssignment();
                Agent agent = agentRepo.findById(agentId).orElseThrow();
                ta.setAgent(agent);
                ta.setDemande(d);
                ta.setStatus(TaskAssignment.Status.ASSIGNED);

                TaskAssignment saved = assignmentRepo.save(ta);
                // ✅ recharger en EAGER avant de retourner
                return assignmentRepo.findByIdEager(saved.getId());
            }
        }
        return Optional.empty();
    }

    /** Hook pratique si tu veux auto-dispatcher à la soumission. */
    @Transactional
    public void tryAutoAssignOnSubmit(Demande d) {
        if (d.getStatut() == StatusDemande.EN_ATTENTE
                && assignmentRepo.findByDemandeId(d.getId()).isEmpty()) {
            pickBestAgent().ifPresent(agent -> {
                TaskAssignment ta = new TaskAssignment();
                ta.setAgent(agent);
                ta.setDemande(d);
                ta.setStatus(TaskAssignment.Status.ASSIGNED);
                assignmentRepo.save(ta);
            });
        }
    }

    /* =======================
       Méthodes internes (pas @Transactional)
       ======================= */

    /** Renvoie l’agent « le plus sûr et le plus disponible ». */
    private Optional<Agent> pickBestAgent() {
        List<Agent> active = agentRepo.findByIsActivatedTrue();
        if (active.isEmpty()) return Optional.empty();

        Agent best = null;
        double bestScore = Double.NEGATIVE_INFINITY;

        for (Agent a : active) {
            double score = computeScore(a);
            if (score > bestScore) {
                bestScore = score;
                best = a;
            }
        }
        return Optional.ofNullable(best);
    }

    /** Calcule un score de priorité pour l’agent. */
    private double computeScore(Agent a) {
        long activeTasks = assignmentRepo.countActiveForAgent(a.getId());
        double availability = 10.0 - Math.min(10, activeTasks);

        LocalDateTime since = LocalDateTime.now().minusMinutes(60);
        boolean activeRecently = logRepo.existsByAgentIdAndTimestampAfter(a.getId(), since);
        double recencyBonus = activeRecently ? 2.0 : 0.0;

        double penalty = 0.0;
        var recent = anomalyRepo.findByAgentIdAndDetectedAtAfter(
                a.getId(), LocalDateTime.now().minusHours(3)
        );
        for (var r : recent) {
            String sev = String.valueOf(r.getSeverity()).toUpperCase();
            penalty += switch (sev) {
                case "CRITICAL" -> 3.0;
                case "HIGH"     -> 2.0;
                case "MEDIUM"   -> 1.0;
                default         -> 0.5;
            };
        }
        return availability + recencyBonus - penalty;
    }

    private boolean hasRecentCriticalAnomaly(Long agentId) {
        return anomalyRepo
                .findByAgentIdAndDetectedAtAfter(agentId, LocalDateTime.now().minusHours(3))
                .stream()
                .anyMatch(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity()));
    }
}
