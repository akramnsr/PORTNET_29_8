package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {


    List<Document> findByDemandeIdOrderByDateUploadDesc(Long demandeId);

    List<Document> findByDemandeId(Long demandeId);


    List<Document> findByDemandeIdAndTypeOrderByDateUploadDesc(Long demandeId, String type);


    List<Document> findByDemandeIdAndNomContainingIgnoreCase(Long demandeId, String nom);


    long countByDemandeId(Long demandeId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Document d WHERE d.demande.id = :demandeId")
    void deleteByDemandeId(@Param("demandeId") Long demandeId);

    @Query("SELECT COALESCE(SUM(d.taille), 0) FROM Document d WHERE d.demande.id = :demandeId")
    Long getTotalSizeByDemandeId(@Param("demandeId") Long demandeId);

    @Query("SELECT d FROM Document d WHERE d.demande.id = :demandeId AND LOWER(d.nom) LIKE LOWER(CONCAT('%.', :extension))")
    List<Document> findByDemandeIdAndExtension(@Param("demandeId") Long demandeId, @Param("extension") String extension);
}