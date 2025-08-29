package com.a.portnet_back.Repositories;

import com.a.portnet_back.Enum.Categorie;
import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.Demande;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {


    List<Demande> findByImportateurIdOrderByDateCreationDesc(Long importateurId);

    List<Demande> findByStatutOrderByDateCreationDesc(StatusDemande statut);


    List<Demande> findByCategorieOrderByDateCreationDesc(Categorie categorie);


    List<Demande> findAllByOrderByDateCreationDesc();


    Optional<Demande> findByNumeroEnregistrement(String numeroEnregistrement);


    long countByStatut(StatusDemande statut);


    long countByImportateurId(Long importateurId);


    long countByCategorie(Categorie categorie);


    long countByNumeroEnregistrementStartingWith(String prefix);

    List<Demande> findByDateCreationBetweenOrderByDateCreationDesc(
            LocalDateTime startDate, LocalDateTime endDate);


    Page<Demande> findByImportateurIdOrderByDateCreationDesc(Long importateurId, Pageable pageable);

    Page<Demande> findByStatutOrderByDateCreationDesc(StatusDemande statut, Pageable pageable);


    @Query("SELECT d FROM Demande d WHERE " +
            "(:numeroEnregistrement IS NULL OR LOWER(d.numeroEnregistrement) LIKE LOWER(CONCAT('%', :numeroEnregistrement, '%'))) AND " +
            "(:statut IS NULL OR d.statut = :statut) AND " +
            "(:categorie IS NULL OR d.categorie = :categorie) AND " +
            "(:importateurId IS NULL OR d.importateur.id = :importateurId) AND " +
            "(:bureauDouanierId IS NULL OR d.bureauDouanier.id = :bureauDouanierId) " +
            "ORDER BY d.dateCreation DESC")
    List<Demande> findByCriteria(@Param("numeroEnregistrement") String numeroEnregistrement,
                                 @Param("statut") StatusDemande statut,
                                 @Param("categorie") Categorie categorie,
                                 @Param("importateurId") Long importateurId,
                                 @Param("bureauDouanierId") Long bureauDouanierId);


    @Query("SELECT d FROM Demande d WHERE " +
            "(:numeroEnregistrement IS NULL OR LOWER(d.numeroEnregistrement) LIKE LOWER(CONCAT('%', :numeroEnregistrement, '%'))) AND " +
            "(:statut IS NULL OR d.statut = :statut) AND " +
            "(:categorie IS NULL OR d.categorie = :categorie) AND " +
            "(:importateurId IS NULL OR d.importateur.id = :importateurId) AND " +
            "(:bureauDouanierId IS NULL OR d.bureauDouanier.id = :bureauDouanierId) " +
            "ORDER BY d.dateCreation DESC")
    Page<Demande> findByCriteria(@Param("numeroEnregistrement") String numeroEnregistrement,
                                 @Param("statut") StatusDemande statut,
                                 @Param("categorie") Categorie categorie,
                                 @Param("importateurId") Long importateurId,
                                 @Param("bureauDouanierId") Long bureauDouanierId,
                                 Pageable pageable);


    @Query("SELECT d FROM Demande d WHERE " +
            "LOWER(d.importateur.nomComplet) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.importateur.societe) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY d.dateCreation DESC")
    List<Demande> findByImportateurNameOrSociete(@Param("searchTerm") String searchTerm);

    @Query("SELECT d FROM Demande d WHERE d.dateCreation >= :since ORDER BY d.dateCreation DESC")
    List<Demande> findRecentDemandes(@Param("since") LocalDateTime since);


    @Query("SELECT d FROM Demande d WHERE d.statut = 'EN_ATTENTE' ORDER BY d.dateCreation ASC")
    List<Demande> findOldestPendingDemandes();


    @Query("SELECT EXTRACT(YEAR FROM d.dateCreation) as year, " +
            "EXTRACT(MONTH FROM d.dateCreation) as month, " +
            "COUNT(d) as count " +
            "FROM Demande d " +
            "GROUP BY EXTRACT(YEAR FROM d.dateCreation), EXTRACT(MONTH FROM d.dateCreation) " +
            "ORDER BY year DESC, month DESC")
    List<Object[]> getDemandesStatsByMonth();


    @Query("SELECT d FROM Demande d WHERE " +
            "(SELECT SUM(m.montant) FROM Marchandise m WHERE m.demande = d) >= :montantMin " +
            "ORDER BY d.dateCreation DESC")
    List<Demande> findByMontantTotalGreaterThan(@Param("montantMin") Double montantMin);

    boolean existsByNumeroEnregistrement(String numeroEnregistrement);


    @Query("SELECT d FROM Demande d WHERE d.statut = 'EN_ATTENTE' AND d.importateur.id = :importateurId ORDER BY d.dateCreation DESC")
    List<Demande> findModifiablesByImportateur(@Param("importateurId") Long importateurId);
}