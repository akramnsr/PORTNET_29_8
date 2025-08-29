package com.a.portnet_back.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class DispatchService {
    private final WebClient client;
    private final String path;

    public DispatchService(WebClient dispatcherWebClient,
                           @Value("${dispatcher.path}") String path) {
        this.client = dispatcherWebClient;
        this.path = path;
    }

    // DispatchService.java
    public Map<String, Object> runOnce(Integer limit) {
        return client.get()
                .uri(uriBuilder -> uriBuilder
                        .path(path)               // path = "/dispatcher"
                        .queryParam("limit", limit == null ? 50 : limit) // défaut 50
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> r.bodyToMono(String.class)
                        .map(msg -> new RuntimeException("Dispatcher error: " + msg)))
                .bodyToMono(new ParameterizedTypeReference<Map<String,Object>>() {})
                .block();
    }


    // pratique si tu ne passes pas de limit
    public Map<String, Object> runOnce() { return runOnce(null); }
}
