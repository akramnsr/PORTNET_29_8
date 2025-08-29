package com.a.portnet_back.Services;

import com.a.portnet_back.DTO.AgentWorkloadDTO;
import com.a.portnet_back.DTO.BulkReassignRequest;
import com.a.portnet_back.DTO.BulkReassignResponse;
import com.a.portnet_back.DTO.DispatchLogDTO;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.Demande;
import com.a.portnet_back.Models.TaskAssignment;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Repositories.DemandeRepository;
import com.a.portnet_back.Repositories.TaskAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkloadService {

    private final AgentRepository agentRepo;
    private final TaskAssignmentRepository taRepo;
    private final DemandeRepository demandeRepo;

    public WorkloadService(AgentRepository agentRepo,
                           TaskAssignmentRepository taRepo,
                           DemandeRepository demandeRepo) {
        this.agentRepo = agentRepo;
        this.taRepo = taRepo;
        this.demandeRepo = demandeRepo;
    }

    public List<AgentWorkloadDTO> computeAgentsWorkload(String q,
                                                        String bureau,     // conservés pour compat front (non utilisés ici)
                                                        String categorie,  // idem
                                                        LocalDate from,
                                                        LocalDate to) {

        LocalDateTime start = (from == null ? LocalDate.now() : from).atStartOfDay();
        LocalDateTime end   = (to   == null ? LocalDate.now() : to).atTime(23, 59, 59);

        // 1) Liste des agents
        List<Agent> agents = agentRepo.findAll();

        if (q != null && !q.isBlank()) {
            String s = q.toLowerCase();
            agents = agents.stream().filter(a ->
                    (a.getNomComplet() != null && a.getNomComplet().toLowerCase().contains(s)) ||
                            (a.getEmail() != null && a.getEmail().toLowerCase().contains(s))
            ).collect(Collectors.toList());
        }

        // Statuts à récupérer via la méthode EAGER existante
        List<TaskAssignment.Status> allStatuses = Arrays.asList(
                TaskAssignment.Status.ASSIGNED,
                TaskAssignment.Status.IN_PROGRESS,
                TaskAssignment.Status.DONE,
                TaskAssignment.Status.CANCELLED
        );

        List<AgentWorkloadDTO> out = new ArrayList<>();

        for (Agent a : agents) {
            // 2) Récupère toutes les affectations (EAGER) puis filtre par période en Java
            List<TaskAssignment> all = taRepo.findEagerByAgentIdAndStatusInOrderByCreatedAtAsc(a.getId(), allStatuses);
            List<TaskAssignment> tas = all.stream()
                    .filter(ta -> !ta.getCreatedAt().isBefore(start) && !ta.getCreatedAt().isAfter(end))
                    .collect(Collectors.toList());

            int total = tas.size();
            int enCours = (int) tas.stream().filter(ta ->
                    ta.getStatus() == TaskAssignment.Status.ASSIGNED ||
                            ta.getStatus() == TaskAssignment.Status.IN_PROGRESS
            ).count();

            int enRetard = (int) tas.stream().filter(ta ->
                    ta.getStatus() != TaskAssignment.Status.DONE &&
                            ta.getCreatedAt().isBefore(LocalDateTime.now().minusDays(2))
            ).count();

            // Durées pour moyenne / médiane (en minutes)
            List<Long> durations = tas.stream()
                    .filter(ta -> ta.getFinishedAt() != null)
                    .map(ta -> {
                        LocalDateTime sAt = ta.getStartedAt() != null ? ta.getStartedAt() : ta.getCreatedAt();
                        return Duration.between(sAt, ta.getFinishedAt()).toMinutes();
                    })
                    .collect(Collectors.toList());

            int avgMin = durations.isEmpty() ? 0 :
                    (int) Math.round(durations.stream().mapToLong(Long::longValue).average().orElse(0));

            int medianMin = 0;
            if (!durations.isEmpty()) {
                Collections.sort(durations);
                int m = durations.size();
                medianMin = (m % 2 == 1)
                        ? durations.get(m / 2).intValue()
                        : (int) Math.round((durations.get(m / 2 - 1) + durations.get(m / 2)) / 2.0);
            }

            // Productivité du jour (DONE pendant la période)
            int prodJ = (int) tas.stream().filter(ta ->
                    ta.getStatus() == TaskAssignment.Status.DONE &&
                            ta.getFinishedAt() != null &&
                            !ta.getFinishedAt().isBefore(start) &&
                            !ta.getFinishedAt().isAfter(end)
            ).count();

            AgentWorkloadDTO dto = new AgentWorkloadDTO();
            dto.setAgentId(a.getId());
            dto.setAgent(a.getNomComplet());
            dto.setDossiersTotal(total);
            dto.setEnCours(enCours);
            dto.setEnRetard(enRetard);
            dto.setTempsMoyenMin(avgMin);
            dto.setSlaMedianMin(medianMin);
            dto.setProductiviteJ(prodJ);

            out.add(dto);
        }
        return out;
    }

    // Journal : placeholder (renvoie pour l’instant une liste vide)
    public List<DispatchLogDTO> getDispatchJournal(Map<String, String> params) {
        return Collections.emptyList();
    }

    // Réaffectation en masse — utilise TON findByDemandeId(...)
    @Transactional
    public BulkReassignResponse bulkReassign(BulkReassignRequest req) {
        BulkReassignResponse res = new BulkReassignResponse();
        if (req == null || req.getDossierIds() == null || req.getTargetAgentId() == null) return res;

        Optional<Agent> targetOpt = agentRepo.findById(req.getTargetAgentId());
        if (targetOpt.isEmpty()) {
            res.getNotFound().add("agent:" + req.getTargetAgentId());
            return res;
        }
        Agent target = targetOpt.get();

        int updated = 0;
        List<String> notFound = new ArrayList<>();

        for (String raw : req.getDossierIds()) {
            try {
                // ici on suppose que le champ reçu est un ID numérique de Demande
                Long demandeId = Long.valueOf(raw.replaceAll("[^0-9]", ""));
                Optional<Demande> dOpt = demandeRepo.findById(demandeId);
                if (dOpt.isEmpty()) { notFound.add(raw); continue; }

                Demande d = dOpt.get();
                TaskAssignment ta = taRepo.findByDemandeId(d.getId()).orElseGet(() -> {
                    TaskAssignment x = new TaskAssignment();
                    x.setDemande(d);
                    x.setStatus(TaskAssignment.Status.ASSIGNED);
                    return x;
                });
                ta.setAgent(target);
                taRepo.save(ta);
                updated++;
            } catch (Exception e) {
                notFound.add(raw);
            }
        }
        res.setUpdated(updated);
        res.setNotFound(notFound);
        return res;
    }
}
