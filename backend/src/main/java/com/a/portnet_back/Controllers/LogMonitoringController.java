package com.a.portnet_back.Controllers;

import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.AgentActivityLog;
import com.a.portnet_back.Models.AnomalyDetectionResult;
import com.a.portnet_back.Repositories.AgentActivityLogRepository;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Repositories.AnomalyDetectionResultRepository;
import com.a.portnet_back.Services.AnomalyDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/supervisor/logs")
public class LogMonitoringController {

    private final AgentRepository agentRepository;
    private final AgentActivityLogRepository logRepository;
    private final AnomalyDetectionResultRepository anomalyRepo;
    private final AnomalyDetectionService anomalyDetectionService;

    public LogMonitoringController(AgentRepository agentRepository,
                                   AgentActivityLogRepository logRepository,
                                   AnomalyDetectionResultRepository anomalyRepo,
                                   AnomalyDetectionService anomalyDetectionService) {
        this.agentRepository = agentRepository;
        this.logRepository = logRepository;
        this.anomalyRepo = anomalyRepo;
        this.anomalyDetectionService = anomalyDetectionService;
    }

    @GetMapping("/{agentId}")
    public ResponseEntity<Map<String, Object>> getLogsAndAnomaliesForAgent(@PathVariable Long agentId) {
        Optional<Agent> agentOpt = agentRepository.findById(agentId);
        if (agentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Agent agent = agentOpt.get();

        // Derniers logs (DESC)
        List<AgentActivityLog> logsDesc = logRepository.findByAgentIdOrderByTimestampDesc(agentId);
        AgentActivityLog lastLog = logsDesc.isEmpty() ? null : logsDesc.get(0);

        // Historique chrono pour l’IA
        List<AgentActivityLog> historyChrono = new ArrayList<>(logsDesc);
        Collections.reverse(historyChrono);

        Map<String, Object> result = anomalyDetectionService.detectAnomalies(agent, lastLog, historyChrono);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> anomalyData = (List<Map<String, Object>>) result.get("anomalies");

        List<AnomalyDetectionResult> anomalies = new ArrayList<>();
        if (anomalyData != null && lastLog != null) {
            for (Map<String, Object> entry : anomalyData) {
                AnomalyDetectionResult anomaly = new AnomalyDetectionResult();
                anomaly.setAgent(agent);
                anomaly.setLog(lastLog);

                anomaly.setSeverity((String) entry.getOrDefault("severity", "LOW"));
                anomaly.setType((String) entry.getOrDefault("type", "UNKNOWN"));
                Object conf = entry.get("confidence");
                anomaly.setConfidence(conf instanceof Number ? ((Number) conf).doubleValue() : 0.0);
                anomaly.setDescription((String) entry.getOrDefault("description", ""));

                anomaly.setMessage(String.format(
                        "[%s] %s (confidence: %.2f)",
                        anomaly.getSeverity(),
                        anomaly.getDescription(),
                        anomaly.getConfidence()
                ));

                anomaly.setDetectedAt(LocalDateTime.now());

                anomalyRepo.save(anomaly);
                anomalies.add(anomaly);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("logs", logsDesc);
        response.put("anomalies", anomalies);
        return ResponseEntity.ok(response);
    }
}
