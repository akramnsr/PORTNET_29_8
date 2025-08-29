// AgentRepository.java - Corrigé
package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {


    Optional<Agent> findByEmail(String email);
    Optional<Agent> findByActivationToken(String activationToken);

    @Query("SELECT a FROM Agent a WHERE a.user.id = :userId")
    Optional<Agent> findByUserId(@Param("userId") Long userId);

    boolean existsByEmail(String email);

    @Query("SELECT a FROM Agent a LEFT JOIN FETCH a.user")
    List<Agent> findAllWithUser();

    List<Agent> findBySuperviseurId(Long superviseurId);


    List<Agent> findByIsActivatedTrue();


    List<Agent> findByIsActivatedFalse();


    List<Agent> findByDepartement(String departement);

    List<Agent> findByDepartementAndSuperviseurId(String departement, Long superviseurId);


    @Query("SELECT COUNT(a) FROM Agent a WHERE a.superviseurId = :superviseurId")
    long countBySuperviseurId(@Param("superviseurId") Long superviseurId);


    @Query("SELECT COUNT(a) FROM Agent a WHERE a.superviseurId = :superviseurId AND a.isActivated = true")
    long countActiveBySuperviseurId(@Param("superviseurId") Long superviseurId);


    @Query("SELECT a FROM Agent a WHERE a.superviseurId = :superviseurId AND a.isActivated = true")
    List<Agent> findActiveBySuperviseurId(@Param("superviseurId") Long superviseurId);



    @Query("SELECT a FROM Agent a WHERE a.superviseurId = :superviseurId AND a.isActivated = false")
    List<Agent> findInactiveBySuperviseurId(@Param("superviseurId") Long superviseurId);
}