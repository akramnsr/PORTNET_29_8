package com.a.portnet_back.Repositories;

import com.a.portnet_back.Models.Importateur;
import com.a.portnet_back.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImportateurRepository extends JpaRepository<Importateur, Long> {


    Optional<Importateur> findByUserId(Long userId);


    Optional<Importateur> findByUser(User user);


    @Query("SELECT i FROM Importateur i WHERE i.user.id = :userId")
    Optional<Importateur> findByUserIdWithQuery(@Param("userId") Long userId);


    @Query("SELECT i FROM Importateur i WHERE i.user.email = :email")
    Optional<Importateur> findByUserEmail(@Param("email") String email);



    List<Importateur> findByNomCompletContainingIgnoreCase(String nomComplet);


    Optional<Importateur> findBySociete(String societe);

    List<Importateur> findBySocieteContainingIgnoreCase(String societe);


    Optional<Importateur> findByIce(String ice);


    Optional<Importateur> findByRc(String rc);


    Optional<Importateur> findByTelephone(String telephone);


    Optional<Importateur> findByEmailProfessionnel(String emailProfessionnel);


    List<Importateur> findByVille(String ville);

    List<Importateur> findByVilleContainingIgnoreCase(String ville);

    List<Importateur> findByPays(String pays);

    List<Importateur> findByPaysContainingIgnoreCase(String pays);

    List<Importateur> findByDomaineActivite(String domaineActivite);

    List<Importateur> findByDomaineActiviteContainingIgnoreCase(String domaineActivite);

    List<Importateur> findByTypeOperation(String typeOperation);


    List<Importateur> findByStatutDouanier(String statutDouanier);


    List<Importateur> findByCertifieISO(boolean certifieISO);



    List<Importateur> findByNomCompletContainingIgnoreCaseOrSocieteContainingIgnoreCase(
            String nomComplet, String societe);


    @Query("SELECT i FROM Importateur i WHERE " +
            "(:nomComplet IS NULL OR LOWER(i.nomComplet) LIKE LOWER(CONCAT('%', :nomComplet, '%'))) AND " +
            "(:societe IS NULL OR LOWER(i.societe) LIKE LOWER(CONCAT('%', :societe, '%'))) AND " +
            "(:ville IS NULL OR LOWER(i.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) AND " +
            "(:pays IS NULL OR LOWER(i.pays) LIKE LOWER(CONCAT('%', :pays, '%'))) AND " +
            "(:domaineActivite IS NULL OR LOWER(i.domaineActivite) LIKE LOWER(CONCAT('%', :domaineActivite, '%')))")
    List<Importateur> findByCriteria(@Param("nomComplet") String nomComplet,
                                     @Param("societe") String societe,
                                     @Param("ville") String ville,
                                     @Param("pays") String pays,
                                     @Param("domaineActivite") String domaineActivite);


    @Query("SELECT i FROM Importateur i LEFT JOIN FETCH i.user")
    List<Importateur> findAllWithUser();

    @Query("SELECT i FROM Importateur i LEFT JOIN FETCH i.user WHERE i.id = :id")
    Optional<Importateur> findByIdWithUser(@Param("id") Long id);


    @Query("SELECT i FROM Importateur i LEFT JOIN FETCH i.user u WHERE u.enabled = true")
    List<Importateur> findActiveImportateurs();

    boolean existsByIce(String ice);
    boolean existsByRc(String rc);

    boolean existsByTelephone(String telephone);

    boolean existsByEmailProfessionnel(String emailProfessionnel);


    boolean existsBySociete(String societe);


    Page<Importateur> findByNomCompletContainingIgnoreCaseOrSocieteContainingIgnoreCase(
            String nomComplet, String societe, Pageable pageable);

    Page<Importateur> findByVilleContainingIgnoreCase(String ville, Pageable pageable);


    Page<Importateur> findByDomaineActiviteContainingIgnoreCase(String domaine, Pageable pageable);


    @Query("SELECT i.ville, COUNT(i) FROM Importateur i GROUP BY i.ville ORDER BY COUNT(i) DESC")
    List<Object[]> countByVille();


    @Query("SELECT i.pays, COUNT(i) FROM Importateur i GROUP BY i.pays ORDER BY COUNT(i) DESC")
    List<Object[]> countByPays();

    @Query("SELECT i.domaineActivite, COUNT(i) FROM Importateur i GROUP BY i.domaineActivite ORDER BY COUNT(i) DESC")
    List<Object[]> countByDomaineActivite();

    long countByCertifieISO(boolean certifieISO);

    @Query("SELECT i FROM Importateur i WHERE " +
            "LOWER(i.nomComplet) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.societe) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.ville) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.domaineActivite) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "i.ice LIKE CONCAT('%', :searchTerm, '%') OR " +
            "i.rc LIKE CONCAT('%', :searchTerm, '%')")
    List<Importateur> searchGlobal(@Param("searchTerm") String searchTerm);

    @Query("SELECT i, COUNT(d) as demandCount FROM Importateur i " +
            "LEFT JOIN Demande d ON d.importateur = i " +
            "GROUP BY i " +
            "ORDER BY demandCount DESC")
    List<Object[]> findTopImportateursByDemandesCount();


    @Query("SELECT i FROM Importateur i WHERE i.id NOT IN " +
            "(SELECT DISTINCT d.importateur.id FROM Demande d WHERE d.importateur IS NOT NULL)")
    List<Importateur> findImportateursWithoutDemandes();
}