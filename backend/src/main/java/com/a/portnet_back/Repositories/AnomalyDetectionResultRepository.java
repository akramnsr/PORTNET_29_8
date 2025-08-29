package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.AnomalyDetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnomalyDetectionResultRepository extends JpaRepository<AnomalyDetectionResult, Long> {
    List<AnomalyDetectionResult> findByAgentId(Long agentId);
    List<AnomalyDetectionResult> findByAgentIdAndDetectedAtAfter(Long agentId, LocalDateTime after);
    List<AnomalyDetectionResult> findBySeverityOrderByDetectedAtDesc(String severity);
}