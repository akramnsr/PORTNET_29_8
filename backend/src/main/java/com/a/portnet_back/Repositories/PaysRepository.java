package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.Pays;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaysRepository extends JpaRepository<Pays, Long> {

    Optional<Pays> findByCode(String code);

    List<Pays> findByCodeContainingIgnoreCase(String code);

    List<Pays> findByDescriptionContainingIgnoreCase(String description);
}