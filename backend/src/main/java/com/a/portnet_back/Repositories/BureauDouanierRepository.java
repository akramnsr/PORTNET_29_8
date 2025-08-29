package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.BureauDouanier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BureauDouanierRepository extends JpaRepository<BureauDouanier, Long> {

    Optional<BureauDouanier> findByCode(String code);

    List<BureauDouanier> findByDescriptionContainingIgnoreCase(String description);
}