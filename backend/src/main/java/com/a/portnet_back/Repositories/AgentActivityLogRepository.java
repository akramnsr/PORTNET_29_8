package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.AgentActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgentActivityLogRepository extends JpaRepository<AgentActivityLog, Long> {

    // Timeline paginée d’un agent
    Page<AgentActivityLog> findByAgentIdOrderByTimestampDesc(Long agentId, Pageable pageable);

    // Timeline complète (non paginée) — utile pour certains contrôleurs
    List<AgentActivityLog> findByAgentIdOrderByTimestampDesc(Long agentId);

    // Activité récente simple (utilisée dans le dispatcher)
    boolean existsByAgentIdAndTimestampAfter(Long agentId, LocalDateTime since);

    // Récupérer les logs depuis une date donnée
    List<AgentActivityLog> findByAgentIdAndTimestampAfter(Long agentId, LocalDateTime since);

    // Top N derniers logs (ex. pour un tableau de bord)
    List<AgentActivityLog> findTop20ByAgentIdOrderByTimestampDesc(Long agentId);

    // Échecs de login récents
    @Query("""
           SELECT l
           FROM AgentActivityLog l
           WHERE l.agent.id = :agentId
             AND l.activityType = 'LOGIN'
             AND l.success = false
             AND l.timestamp > :since
           ORDER BY l.timestamp DESC
           """)
    List<AgentActivityLog> findFailedLoginsSince(@Param("agentId") Long agentId,
                                                 @Param("since") LocalDateTime since);

    // Connexions réussies (paginées)
    @Query("""
           SELECT l
           FROM AgentActivityLog l
           WHERE l.agent.id = :agentId
             AND l.activityType = 'LOGIN'
             AND l.success = true
           ORDER BY l.timestamp DESC
           """)
    Page<AgentActivityLog> findSuccessfulLogins(@Param("agentId") Long agentId,
                                                Pageable pageable);

    // Logs d’un ensemble d’agents sur une plage de dates
    @Query("""
           SELECT l
           FROM AgentActivityLog l
           WHERE l.agent.id IN :agentIds
             AND l.timestamp BETWEEN :startDate AND :endDate
           ORDER BY l.timestamp DESC
           """)
    List<AgentActivityLog> findByAgentIdsAndDateRange(@Param("agentIds") List<Long> agentIds,
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    // Compter un type d’activité depuis une date
    @Query("""
           SELECT COUNT(l)
           FROM AgentActivityLog l
           WHERE l.agent.id = :agentId
             AND l.activityType = :activityType
             AND l.timestamp > :since
           """)
    long countByAgentAndActivityTypeSince(@Param("agentId") Long agentId,
                                          @Param("activityType") String activityType,
                                          @Param("since") LocalDateTime since);

    // Sessions actives (sessionId non nul) depuis une date
    @Query("""
           SELECT DISTINCT l.sessionId
           FROM AgentActivityLog l
           WHERE l.agent.id = :agentId
             AND l.sessionId IS NOT NULL
             AND l.timestamp > :since
           """)
    List<String> findActiveSessionIds(@Param("agentId") Long agentId,
                                      @Param("since") LocalDateTime since);

    // “Dernière” activité sans LIMIT : on s’appuie sur une méthode dérivée Top1
    default AgentActivityLog findLastActivityByAgentId(Long agentId) {
        List<AgentActivityLog> top = findTop1ByAgentIdOrderByTimestampDesc(agentId);
        return top.isEmpty() ? null : top.get(0);
    }

    // support de findLastActivityByAgentId
    List<AgentActivityLog> findTop1ByAgentIdOrderByTimestampDesc(Long agentId);
}
