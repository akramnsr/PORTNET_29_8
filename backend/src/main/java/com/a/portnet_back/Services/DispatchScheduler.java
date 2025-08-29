package com.a.portnet_back.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DispatchScheduler {
    private static final Logger log = LoggerFactory.getLogger(DispatchScheduler.class);

    private final DispatchService service;
    public DispatchScheduler(DispatchService service) { this.service = service; }

    // toutes les 5 minutes
    @Scheduled(cron = "0 */5 * * * *")
    public void scheduledRun() {
        try {
            var res = service.runOnce();
            log.info("Dispatch périodique: {}", res);
        } catch (Exception e) {
            log.error("Dispatch périodique en erreur", e);
        }
    }
}
