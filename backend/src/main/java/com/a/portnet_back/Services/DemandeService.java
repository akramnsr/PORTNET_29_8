package com.a.portnet_back.Services;

import com.a.portnet_back.Enum.Categorie;
import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.*;
import com.a.portnet_back.Repositories.DemandeRepository;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final TaskDispatcherService taskDispatcherService;

    @PersistenceContext
    private EntityManager entityManager;

    public DemandeService(DemandeRepository demandeRepository,
                          TaskDispatcherService taskDispatcherService) {
        this.demandeRepository = demandeRepository;
        this.taskDispatcherService = taskDispatcherService;
    }

    @Transactional
    public Demande createDemande(Categorie categorie, Importateur importateur,
                                 BureauDouanier bureauDouanier, Devise devise) {

        String numeroEnregistrement = generateNumeroEnregistrement(categorie);

        Demande demande = new Demande(numeroEnregistrement, categorie, importateur);
        demande.setBureauDouanier(bureauDouanier);
        demande.setDevise(devise);
        demande.setStatut(StatusDemande.EN_ATTENTE);

        return demandeRepository.save(demande);
    }

    public Demande getDemandeById(Long id) {
        return demandeRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Demande getDemandeWithDetails(Long demandeId) {
        String jpql1 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.marchandises m
            LEFT JOIN FETCH m.pays
            LEFT JOIN FETCH d.bureauDouanier bd
            LEFT JOIN FETCH d.devise dev
            LEFT JOIN FETCH d.importateur imp
            LEFT JOIN FETCH imp.user u
            WHERE d.id = :demandeId
            """;

        List<Demande> results = entityManager.createQuery(jpql1, Demande.class)
                .setParameter("demandeId", demandeId)
                .getResultList();

        if (results.isEmpty()) {
            return null;
        }

        Demande demande = results.get(0);

        String jpql2 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.documents doc
            WHERE d.id = :demandeId
            """;

        entityManager.createQuery(jpql2, Demande.class)
                .setParameter("demandeId", demandeId)
                .getResultList();

        return demande;
    }

    public List<Demande> getDemandesByImportateur(Long importateurId) {
        return demandeRepository.findByImportateurIdOrderByDateCreationDesc(importateurId);
    }

    @Transactional(readOnly = true)
    public List<Demande> getDemandesWithDetailsForImportateur(Long importateurId) {
        String jpql1 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.marchandises m
            LEFT JOIN FETCH m.pays
            LEFT JOIN FETCH d.bureauDouanier bd
            LEFT JOIN FETCH d.devise dev
            LEFT JOIN FETCH d.importateur imp
            LEFT JOIN FETCH imp.user u
            WHERE d.importateur.id = :importateurId
            ORDER BY d.dateCreation DESC
            """;

        List<Demande> demandes = entityManager.createQuery(jpql1, Demande.class)
                .setParameter("importateurId", importateurId)
                .getResultList();

        if (demandes.isEmpty()) {
            return demandes;
        }

        Set<Long> demandeIds = new HashSet<>();
        for (Demande d : demandes) {
            demandeIds.add(d.getId());
        }

        String jpql2 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.documents doc
            WHERE d.id IN :demandeIds
            """;

        entityManager.createQuery(jpql2, Demande.class)
                .setParameter("demandeIds", demandeIds)
                .getResultList();

        return demandes;
    }

    @Transactional(readOnly = true)
    public void initializeLazyCollections(Demande demande) {
        if (demande != null) {
            Hibernate.initialize(demande.getMarchandises());
            Hibernate.initialize(demande.getDocuments());

            if (demande.getMarchandises() != null) {
                demande.getMarchandises().forEach(marchandise -> {
                    if (marchandise.getPays() != null) {
                        Hibernate.initialize(marchandise.getPays());
                    }
                });
            }
        }
    }

    public List<Demande> getAllDemandes() {
        return demandeRepository.findAllByOrderByDateCreationDesc();
    }

    @Transactional(readOnly = true)
    public List<Demande> getAllDemandesWithDetails() {
        String jpql1 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.marchandises m
            LEFT JOIN FETCH m.pays
            LEFT JOIN FETCH d.bureauDouanier bd
            LEFT JOIN FETCH d.devise dev
            LEFT JOIN FETCH d.importateur imp
            LEFT JOIN FETCH imp.user u
            ORDER BY d.dateCreation DESC
            """;

        List<Demande> demandes = entityManager.createQuery(jpql1, Demande.class)
                .getResultList();

        if (demandes.isEmpty()) {
            return demandes;
        }

        Set<Long> demandeIds = new HashSet<>();
        for (Demande d : demandes) {
            demandeIds.add(d.getId());
        }

        String jpql2 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.documents doc
            WHERE d.id IN :demandeIds
            """;

        entityManager.createQuery(jpql2, Demande.class)
                .setParameter("demandeIds", demandeIds)
                .getResultList();

        return demandes;
    }

    public List<Demande> getDemandesByStatut(StatusDemande statut) {
        return demandeRepository.findByStatutOrderByDateCreationDesc(statut);
    }

    @Transactional(readOnly = true)
    public List<Demande> getDemandesByStatutWithDetails(StatusDemande statut) {
        String jpql1 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.marchandises m
            LEFT JOIN FETCH m.pays
            LEFT JOIN FETCH d.bureauDouanier bd
            LEFT JOIN FETCH d.devise dev
            LEFT JOIN FETCH d.importateur imp
            LEFT JOIN FETCH imp.user u
            WHERE d.statut = :statut
            ORDER BY d.dateCreation DESC
            """;

        List<Demande> demandes = entityManager.createQuery(jpql1, Demande.class)
                .setParameter("statut", statut)
                .getResultList();

        if (demandes.isEmpty()) {
            return demandes;
        }

        Set<Long> demandeIds = new HashSet<>();
        for (Demande d : demandes) {
            demandeIds.add(d.getId());
        }

        String jpql2 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.documents doc
            WHERE d.id IN :demandeIds
            """;

        entityManager.createQuery(jpql2, Demande.class)
                .setParameter("demandeIds", demandeIds)
                .getResultList();

        return demandes;
    }

    @Transactional
    public Demande updateStatut(Long demandeId, StatusDemande nouveauStatut, String commentaire) {
        Demande demande = getDemandeById(demandeId);
        if (demande == null) {
            throw new RuntimeException("Demande non trouvée");
        }

        demande.setStatut(nouveauStatut);
        demande.setCommentaire(commentaire);
        demande.markAsModified();

        return demandeRepository.save(demande);
    }

    @Transactional
    public Demande addMarchandise(Long demandeId, Marchandise marchandise) {
        Demande demande = getDemandeById(demandeId);
        if (demande == null) {
            throw new RuntimeException("Demande non trouvée");
        }

        if (!demande.isModifiable()) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        demande.addMarchandise(marchandise);
        demande.markAsModified();

        return demandeRepository.save(demande);
    }

    @Transactional
    public Demande soumetteDemande(Long demandeId) {
        Demande demande = getDemandeById(demandeId);
        if (demande == null) {
            throw new RuntimeException("Demande non trouvée");
        }
        if (!demande.isComplete()) {
            throw new RuntimeException("La demande n'est pas complète");
        }

        demande = demandeRepository.save(demande);

        // 🚀 Appel du dispatcher pour affecter automatiquement la demande à un agent
        taskDispatcherService.tryAutoAssignOnSubmit(demande);

        return demande;
    }

    @Transactional
    public void deleteDemande(Long demandeId) {
        Demande demande = getDemandeById(demandeId);
        if (demande == null) {
            throw new RuntimeException("Demande non trouvée");
        }

        if (!demande.isModifiable()) {
            throw new RuntimeException("Cette demande ne peut pas être supprimée");
        }

        demandeRepository.delete(demande);
    }

    public List<Demande> searchDemandes(String numeroEnregistrement, StatusDemande statut,
                                        Categorie categorie, Long importateurId) {
        return demandeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Demande> searchDemandesWithDetails(String numeroEnregistrement, StatusDemande statut,
                                                   Categorie categorie, Long importateurId) {
        StringBuilder jpql1 = new StringBuilder("""
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.marchandises m
            LEFT JOIN FETCH m.pays
            LEFT JOIN FETCH d.bureauDouanier bd
            LEFT JOIN FETCH d.devise dev
            LEFT JOIN FETCH d.importateur imp
            LEFT JOIN FETCH imp.user u
            WHERE 1=1
            """);

        if (numeroEnregistrement != null && !numeroEnregistrement.trim().isEmpty()) {
            jpql1.append(" AND d.numeroEnregistrement LIKE :numeroEnregistrement");
        }
        if (statut != null) {
            jpql1.append(" AND d.statut = :statut");
        }
        if (categorie != null) {
            jpql1.append(" AND d.categorie = :categorie");
        }
        if (importateurId != null) {
            jpql1.append(" AND d.importateur.id = :importateurId");
        }

        jpql1.append(" ORDER BY d.dateCreation DESC");

        var query1 = entityManager.createQuery(jpql1.toString(), Demande.class);

        if (numeroEnregistrement != null && !numeroEnregistrement.trim().isEmpty()) {
            query1.setParameter("numeroEnregistrement", "%" + numeroEnregistrement.trim() + "%");
        }
        if (statut != null) {
            query1.setParameter("statut", statut);
        }
        if (categorie != null) {
            query1.setParameter("categorie", categorie);
        }
        if (importateurId != null) {
            query1.setParameter("importateurId", importateurId);
        }

        List<Demande> demandes = query1.getResultList();

        if (demandes.isEmpty()) {
            return demandes;
        }

        Set<Long> demandeIds = new HashSet<>();
        for (Demande d : demandes) {
            demandeIds.add(d.getId());
        }

        String jpql2 = """
            SELECT DISTINCT d FROM Demande d
            LEFT JOIN FETCH d.documents doc
            WHERE d.id IN :demandeIds
            """;

        entityManager.createQuery(jpql2, Demande.class)
                .setParameter("demandeIds", demandeIds)
                .getResultList();

        return demandes;
    }

    public DemandeStats getStats() {
        long totalDemandes = demandeRepository.count();
        long demandesEnAttente = demandeRepository.countByStatut(StatusDemande.EN_ATTENTE);
        long demandesAcceptees = demandeRepository.countByStatut(StatusDemande.ACCEPTEE);
        long demandesRefusees = demandeRepository.countByStatut(StatusDemande.REFUSEE);

        return new DemandeStats(totalDemandes, demandesEnAttente, demandesAcceptees, demandesRefusees);
    }

    @Transactional(readOnly = true)
    public DemandeStats getStatsForImportateur(Long importateurId) {
        String jpql = """
            SELECT 
                COUNT(d),
                COUNT(CASE WHEN d.statut = :enAttente THEN 1 END),
                COUNT(CASE WHEN d.statut = :acceptee THEN 1 END),
                COUNT(CASE WHEN d.statut = :refusee THEN 1 END)
            FROM Demande d 
            WHERE d.importateur.id = :importateurId
            """;

        Object[] result = (Object[]) entityManager.createQuery(jpql)
                .setParameter("importateurId", importateurId)
                .setParameter("enAttente", StatusDemande.EN_ATTENTE)
                .setParameter("acceptee", StatusDemande.ACCEPTEE)
                .setParameter("refusee", StatusDemande.REFUSEE)
                .getSingleResult();

        return new DemandeStats(
                ((Number) result[0]).longValue(),
                ((Number) result[1]).longValue(),
                ((Number) result[2]).longValue(),
                ((Number) result[3]).longValue()
        );
    }

    private String generateNumeroEnregistrement(Categorie categorie) {
        String prefix = categorie == Categorie.IMPORTATION ? "IMP" : "EXP";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        long count = demandeRepository.countByNumeroEnregistrementStartingWith(prefix + timestamp);
        String suffix = String.format("%03d", count + 1);

        return prefix + timestamp + suffix;
    }

    public static class DemandeStats {
        private final long total;
        private final long enAttente;
        private final long acceptees;
        private final long refusees;

        public DemandeStats(long total, long enAttente, long acceptees, long refusees) {
            this.total = total;
            this.enAttente = enAttente;
            this.acceptees = acceptees;
            this.refusees = refusees;
        }

        public long getTotal() { return total; }
        public long getEnAttente() { return enAttente; }
        public long getAcceptees() { return acceptees; }
        public long getRefusees() { return refusees; }
    }
}
