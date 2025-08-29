package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.TaskAssignment;
import com.a.portnet_back.Models.TaskAssignment.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    // ancienne méthode (peut rester si utilisée ailleurs)
    List<TaskAssignment> findByAgentIdAndStatusInOrderByCreatedAtAsc(Long agentId, List<Status> statuses);

    Optional<TaskAssignment> findByDemandeId(Long demandeId);

    @Query("select count(t) from TaskAssignment t where t.agent.id = :agentId and t.status in ('ASSIGNED','IN_PROGRESS')")
    long countActiveForAgent(Long agentId);

    // ✅ versions EAGER (JOIN FETCH) pour éviter le lazy en dehors de la session
    @Query("""
           select ta from TaskAssignment ta
           join fetch ta.agent a
           join fetch ta.demande d
           where a.id = :agentId and ta.status in :statuses
           order by ta.createdAt asc
           """)
    List<TaskAssignment> findEagerByAgentIdAndStatusInOrderByCreatedAtAsc(
            @Param("agentId") Long agentId,
            @Param("statuses") List<Status> statuses
    );

    @Query("""
           select ta from TaskAssignment ta
           join fetch ta.agent
           join fetch ta.demande
           where ta.id = :id
           """)
    Optional<TaskAssignment> findByIdEager(@Param("id") Long id);
}
