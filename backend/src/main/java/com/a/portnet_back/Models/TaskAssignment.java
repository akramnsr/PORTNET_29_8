package com.a.portnet_back.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignments",
        indexes = {
                @Index(columnList = "agent_id"),
                @Index(columnList = "demande_id"),
                @Index(columnList = "status")
        })
public class TaskAssignment {

    public enum Status { ASSIGNED, IN_PROGRESS, DONE, CANCELLED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", unique = true) // une demande ne peut être affectée qu’à un agent
    private Demande demande;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ASSIGNED;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    // getters/setters
    public Long getId() { return id; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public Demande getDemande() { return demande; }
    public void setDemande(Demande demande) { this.demande = demande; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
}
