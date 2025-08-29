package com.a.portnet_back.Controllers;

import com.a.portnet_back.Services.DispatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {
    private final DispatchService service;
    public DispatchController(DispatchService service) { this.service = service; }

    // DispatchController.java
    @PostMapping("/run")
    public ResponseEntity<?> run(@RequestParam(name = "limit", required = false) Integer limit) {
        return ResponseEntity.ok(service.runOnce(limit));
    }

}

