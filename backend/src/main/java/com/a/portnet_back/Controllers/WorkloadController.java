package com.a.portnet_back.Controllers;

import com.a.portnet_back.DTO.AgentWorkloadDTO;
import com.a.portnet_back.DTO.BulkReassignRequest;
import com.a.portnet_back.DTO.BulkReassignResponse;
import com.a.portnet_back.DTO.DispatchLogDTO;
import com.a.portnet_back.Services.WorkloadService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WorkloadController {

    private final WorkloadService service;

    public WorkloadController(WorkloadService service) {
        this.service = service;
    }

    @GetMapping("/agents/workload")
    public ResponseEntity<List<AgentWorkloadDTO>> agentsWorkload(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String bureau,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(service.computeAgentsWorkload(q, bureau, categorie, from, to));
    }

    @GetMapping("/dispatch/journal")
    public ResponseEntity<Map<String, Object>> dispatchJournal(@RequestParam Map<String,String> params) {
        List<DispatchLogDTO> items = service.getDispatchJournal(params);
        return ResponseEntity.ok(Map.of("items", items, "total", items.size()));
    }

    @PostMapping("/dossiers/bulk-reassign")
    public ResponseEntity<BulkReassignResponse> bulk(@RequestBody BulkReassignRequest req) {
        return ResponseEntity.ok(service.bulkReassign(req));
    }
}
