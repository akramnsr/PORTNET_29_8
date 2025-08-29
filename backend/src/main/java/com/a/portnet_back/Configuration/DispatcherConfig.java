package com.a.portnet_back.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
@EnableScheduling // utile si tu ajoutes le scheduler plus bas
public class DispatcherConfig {

    @Bean
    WebClient dispatcherWebClient(
            @Value("${dispatcher.base-url}") String baseUrl,
            @Value("${dispatcher.key}") String key,
            @Value("${dispatcher.timeout-ms}") long timeoutMs) {

        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Dispatcher-Key", key)
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofMillis(timeoutMs))
                ))
                .build();
    }
}
