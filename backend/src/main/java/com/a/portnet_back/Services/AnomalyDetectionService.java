package com.a.portnet_back.Services;

import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.AgentActivityLog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AnomalyDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionService.class);

    private final RestTemplate restTemplate;

    @Value("${anomaly.detection.service.url:http://localhost:5000}")
    private String serviceUrl;

    public AnomalyDetectionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> detectAnomalies(Agent agent, AgentActivityLog currentLog, List<AgentActivityLog> history) {
        if (currentLog == null) {
            logger.warn("Pas de log actuel pour l'agent {}", agent.getId());
            return createEmptyResponse();
        }

        String url = serviceUrl + "/api/detect-anomalies";

        Map<String, Object> payload = new HashMap<>();
        payload.put("agent", convertAgentToMap(agent));
        payload.put("currentLog", convertLogToMap(currentLog));
        payload.put("history", convertLogsToMaps(history));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                logger.error("Réponse non valide du service IA: {}", response.getStatusCode());
                return createEmptyResponse();
            }
        } catch (RestClientException e) {
            logger.error("Erreur lors de l'appel au service IA: ", e);
            return createEmptyResponse();
        }
    }

    private Map<String, Object> createEmptyResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("anomalies", new ArrayList<>());
        response.put("timestamp", new Date());
        return response;
    }

    private Map<String, Object> convertAgentToMap(Agent agent) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", agent.getId());
        map.put("email", agent.getEmail());
        map.put("nomComplet", agent.getNomComplet());
        return map;
    }

    private Map<String, Object> convertLogToMap(AgentActivityLog log) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", log.getId());
        map.put("activityType", log.getActivityType());


        map.put("timestamp", log.getTimestamp() != null ? log.getTimestamp().toString() : null);

        map.put("ipAddress", log.getIpAddress());
        map.put("deviceInfo", log.getDeviceInfo());
        map.put("browserInfo", log.getBrowserInfo());
        map.put("success", log.isSuccess());
        return map;
    }

    private List<Map<String, Object>> convertLogsToMaps(List<AgentActivityLog> logs) {
        List<Map<String, Object>> maps = new ArrayList<>();
        for (AgentActivityLog log : logs) {
            maps.add(convertLogToMap(log));
        }
        return maps;
    }
}
