package com.a.portnet_back.Controllers;

import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.AgentActivityLog;
import com.a.portnet_back.Repositories.AgentActivityLogRepository;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Services.AnomalyDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/supervisor")
public class SupervisorController {

    private final AgentRepository agentRepo;
    private final AgentActivityLogRepository logRepo;
    private final AnomalyDetectionService anomalyService;

    public SupervisorController(AgentRepository agentRepo,
                                AgentActivityLogRepository logRepo,
                                AnomalyDetectionService anomalyService) {
        this.agentRepo = agentRepo;
        this.logRepo = logRepo;
        this.anomalyService = anomalyService;
    }

    /**
     * Retourne, pour chaque agent, ses derniers logs + anomalies détectées par le service IA.
     * On récupère les logs en ordre DESC, puis on inverse pour fournir l’historique chrono à l’IA.
     */
    @GetMapping("/agents-logs-anomalies")
    public ResponseEntity<List<Map<String, Object>>> getAllAgentsWithLogsAndAnomalies() {
        List<Agent> agents = agentRepo.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Agent agent : agents) {
            // DESC (du plus récent au plus ancien)
            List<AgentActivityLog> logsDesc = logRepo.findByAgentIdOrderByTimestampDesc(agent.getId());

            // courant = le plus récent
            AgentActivityLog currentLog = logsDesc.isEmpty() ? null : logsDesc.get(0);

            // Historique chronologique (du plus ancien au plus récent) pour le service d’anomalies
            List<AgentActivityLog> historyChrono = new ArrayList<>(logsDesc);
            Collections.reverse(historyChrono);

            Map<String, Object> anomalyResult = new HashMap<>();
            if (currentLog != null) {
                anomalyResult = anomalyService.detectAnomalies(agent, currentLog, historyChrono);
            }

            Map<String, Object> agentData = new HashMap<>();
            agentData.put("agent", agent);
            agentData.put("logs", logsDesc);                 // tu peux aussi renvoyer historyChrono si tu préfères
            agentData.put("anomalies", anomalyResult.get("anomalies"));

            response.add(agentData);
        }

        return ResponseEntity.ok(response);
    }
}
