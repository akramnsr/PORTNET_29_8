package com.a.portnet_back.Repositories;

import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.Devise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviseRepository extends JpaRepository<Devise, Long> {

    Optional<Devise> findByCode(String code);

    List<Devise> findByStatus(StatusDemande status);

    List<Devise> findByDescriptionContainingIgnoreCase(String description);
}