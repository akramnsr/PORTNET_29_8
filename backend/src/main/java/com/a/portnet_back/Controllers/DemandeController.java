package com.a.portnet_back.Controllers;

import com.a.portnet_back.Enum.Categorie;
import com.a.portnet_back.Enum.StatusDemande;
import com.a.portnet_back.Models.*;
import com.a.portnet_back.Services.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:3000")
public class DemandeController {

    private final DemandeService demandeService;
    private final DocumentService documentService;
    private final ExcelImportService excelImportService;
    private final ImportateurService importateurService;
    private final BureauDouanierService bureauDouanierService;
    private final DeviseService deviseService;

    public DemandeController(DemandeService demandeService, DocumentService documentService,
                             ExcelImportService excelImportService, ImportateurService importateurService,
                             BureauDouanierService bureauDouanierService, DeviseService deviseService) {
        this.demandeService = demandeService;
        this.documentService = documentService;
        this.excelImportService = excelImportService;
        this.importateurService = importateurService;
        this.bureauDouanierService = bureauDouanierService;
        this.deviseService = deviseService;
    }

    /** ✅ Liste back-office pour AGENT / SUPERVISEUR (format DataGrid) */
    @GetMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERVISEUR','ROLE_AGENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listDemandesBackOffice(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "bureau", required = false) String bureau
    ) {
        var demandes = demandeService.getAllDemandesWithDetails();

        var rows = demandes.stream().map(d -> {
            var m = new HashMap<String, Object>();

            // ID lisible + ID DB
            m.put("id",   d.getNumeroEnregistrement());
            m.put("idDb", d.getId());

            // Catégorie
            m.put("categorie", d.getCategorie() != null ? d.getCategorie().name() : "—");

            // Bureau (fallback code si description absente)
            String bureauLabel = "—";
            if (d.getBureauDouanier() != null) {
                String desc = d.getBureauDouanier().getDescription();
                String code = d.getBureauDouanier().getCode();
                bureauLabel = (desc != null && !desc.isBlank())
                        ? desc
                        : (code != null && !code.isBlank() ? code : "—");
            }
            m.put("bureau", bureauLabel);

            // Statut → mapping UI
            m.put("statut", mapStatutToUi(d.getStatut()));

            // Dates (créé le)
            m.put("createdAt", d.getDateCreation());

            // Agent (placeholder si pas d’affectation)
            m.put("agent", "-");

            // Opérateur (prend ce qu’on peut)
            String operateur = "—";
            if (d.getSocieteImportateur() != null && !d.getSocieteImportateur().isBlank()) {
                operateur = d.getSocieteImportateur();
            } else if (d.getNomImportateur() != null && !d.getNomImportateur().isBlank()) {
                operateur = d.getNomImportateur();
            } else if (d.getImportateur() != null) {
                // derniers filets de sécurité
                String nom = d.getImportateur().getNomComplet();
                String soc = d.getImportateur().getSociete();
                operateur = (soc != null && !soc.isBlank()) ? soc
                        : (nom != null && !nom.isBlank() ? nom : "—");
            }
            m.put("operateur", operateur);

            // ICE si disponible (sinon —)
            String ice = "—";
            if (d.getImportateur() != null && d.getImportateur().getIce() != null && !d.getImportateur().getIce().isBlank()) {
                ice = d.getImportateur().getIce();
            }
            m.put("ice", ice);

            // Montant / SLA
            m.put("montant", d.getMontantTotal() != null ? d.getMontantTotal() : 0.0);
            m.put("slaHours", 72);

            return m;
        }).filter(m -> {
            if (q != null && !q.isBlank()) {
                var hay = (m.get("id")+" "+m.get("ice")+" "+m.get("operateur")+" "+m.get("agent")+" "+m.get("categorie")+" "+m.get("bureau")).toLowerCase();
                if (!hay.contains(q.toLowerCase())) return false;
            }
            if (statut != null && !statut.isBlank() && !statut.equals(m.get("statut"))) return false;
            if (bureau != null && !bureau.isBlank() && !bureau.equals(m.get("bureau"))) return false;
            return true;
        }).toList();

        return ResponseEntity.ok(rows);
    }

    private String mapStatutToUi(StatusDemande s) {
        if (s == null) return "EN_ATTENTE";
        return switch (s) {
            case EN_ATTENTE -> "EN_ATTENTE";
            case ACCEPTEE   -> "VALIDE";
            case REFUSEE    -> "REJETE";
            default -> s.name();
        };
    }

    /** Créer une nouvelle demande (étape 1) */
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional
    public ResponseEntity<?> createDemande(
            @RequestParam("categorie") Categorie categorie,
            @RequestParam("bureauDouanierId") Long bureauDouanierId,
            @RequestParam("deviseId") Long deviseId,
            Authentication auth) {
        try {
            Importateur importateur = importateurService.getImportateurByEmail(auth.getName());
            if (importateur == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Profil importateur non trouvé"));
            }

            BureauDouanier bureauDouanier = bureauDouanierService.getBureauById(bureauDouanierId);
            if (bureauDouanier == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Bureau douanier non trouvé"));
            }

            Devise devise = deviseService.getDeviseById(deviseId);
            if (devise == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Devise non trouvée"));
            }

            Demande demande = demandeService.createDemande(categorie, importateur, bureauDouanier, devise);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande créée avec succès");
            response.put("demande", createDemandeResponse(demande));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la création: " + e.getMessage()));
        }
    }

    /** Import marchandises depuis Excel (étape 2) */
    @PostMapping("/{demandeId}/import-marchandises")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional
    public ResponseEntity<?> importMarchandises(
            @PathVariable Long demandeId,
            @RequestParam("file") MultipartFile file) {
        try {
            Demande demande = demandeService.getDemandeById(demandeId);
            if (demande == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Demande non trouvée"));
            }

            if (!demande.isModifiable()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Cette demande ne peut plus être modifiée"));
            }

            List<Marchandise> marchandises = excelImportService.importMarchandisesFromExcel(file);
            for (Marchandise marchandise : marchandises) {
                demandeService.addMarchandise(demandeId, marchandise);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", marchandises.size() + " marchandises importées avec succès");
            response.put("marchandises", marchandises.stream().map(this::createMarchandiseResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Erreur lors de l'import: " + e.getMessage()));
        }
    }

    /** Upload documents (étape 3) */
    @PostMapping("/{demandeId}/upload-documents")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional
    public ResponseEntity<?> uploadDocuments(
            @PathVariable Long demandeId,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            Demande demande = demandeService.getDemandeById(demandeId);
            if (demande == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Demande non trouvée"));
            }

            if (!demande.isModifiable()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Cette demande ne peut plus être modifiée"));
            }

            List<Document> documents = documentService.uploadMultipleDocuments(files, demande);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", documents.size() + " documents uploadés avec succès");
            response.put("documents", documents.stream().map(this::createDocumentResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'upload: " + e.getMessage()));
        }
    }

    /** Finaliser et soumettre la demande (étape 4) */
    @PostMapping("/{demandeId}/submit")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional
    public ResponseEntity<?> submitDemande(@PathVariable Long demandeId) {
        try {
            Demande demande = demandeService.soumetteDemande(demandeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande soumise avec succès");
            response.put("demande", createDemandeResponse(demande));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Erreur lors de la soumission: " + e.getMessage()));
        }
    }

    /** Obtenir les demandes de l'importateur connecté (simple) */
    @GetMapping("/mes-demandes")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMesDemandes(Authentication auth) {
        try {
            Importateur importateur = importateurService.getImportateurByEmail(auth.getName());
            if (importateur == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Profil importateur non trouvé"));
            }

            List<Demande> demandes = demandeService.getDemandesByImportateur(importateur.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("demandes", demandes.stream().map(this::createDemandeResponse).toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération: " + e.getMessage()));
        }
    }

    /** 🔧 Récupération détaillée avec transactions séparées */
    @GetMapping("/mes-demandes-detaillees")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    public ResponseEntity<?> getMesDemandesDetaillees(Authentication auth) {
        try {
            Importateur importateur = getImportateurSafely(auth.getName());
            if (importateur == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Profil importateur non trouvé"));
            }

            List<Map<String, Object>> demandesDetaillees = getDemandesDetailleesWithSeparateTransaction(importateur.getId());
            Map<String, Object> statistiques = calculateStatistiquesSafely(demandesDetaillees);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("importateur", Map.of(
                    "id", importateur.getId(),
                    "nomComplet", importateur.getNomComplet(),
                    "societe", importateur.getSociete(),
                    "email", importateur.getUser().getEmail()
            ));
            response.put("statistiques", statistiques);
            response.put("demandes", demandesDetaillees);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération: " + e.getMessage()));
        }
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    private Importateur getImportateurSafely(String email) {
        try {
            return importateurService.getImportateurByEmail(email);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération de l'importateur: " + e.getMessage());
            return null;
        }
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    private List<Map<String, Object>> getDemandesDetailleesWithSeparateTransaction(Long importateurId) {
        List<Map<String, Object>> demandesDetaillees = new ArrayList<>();
        try {
            List<Demande> demandes = demandeService.getDemandesWithDetailsForImportateur(importateurId);
            for (Demande demande : demandes) {
                try {
                    initializeCollectionsSafely(demande);
                    Map<String, Object> demandeDetail = createDemandeCompleteResponseSafely(demande);
                    demandesDetaillees.add(demandeDetail);
                } catch (Exception e) {
                    System.err.println("Erreur lors du traitement de la demande " + demande.getId() + ": " + e.getMessage());
                    Map<String, Object> demandeMinimale = createDemandeResponseSafely(demande);
                    demandesDetaillees.add(demandeMinimale);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des demandes: " + e.getMessage());
            e.printStackTrace();
        }
        return demandesDetaillees;
    }

    private void initializeCollectionsSafely(Demande demande) {
        try {
            if (demande.getMarchandises() != null) {
                demande.getMarchandises().size();
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation des marchandises: " + e.getMessage());
        }
        try {
            if (demande.getDocuments() != null) {
                demande.getDocuments().size();
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation des documents: " + e.getMessage());
        }
    }

    private Map<String, Object> calculateStatistiquesSafely(List<Map<String, Object>> demandesDetaillees) {
        try {
            int totalDemandes = demandesDetaillees.size();
            int demandesEnAttente = 0;
            int demandesAcceptees = 0;
            int demandesRefusees = 0;
            double montantTotal = 0.0;

            for (Map<String, Object> demande : demandesDetaillees) {
                try {
                    String statut = (String) demande.get("statut");
                    if (statut != null) {
                        switch (statut) {
                            case "EN_ATTENTE" -> demandesEnAttente++;
                            case "ACCEPTEE" -> demandesAcceptees++;
                            case "REFUSEE" -> demandesRefusees++;
                        }
                    }
                    Object statistiquesMarchandises = demande.get("statistiquesMarchandises");
                    if (statistiquesMarchandises instanceof Map) {
                        Object montant = ((Map<?, ?>) statistiquesMarchandises).get("montantTotal");
                        if (montant instanceof Number) {
                            montantTotal += ((Number) montant).doubleValue();
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Erreur lors du calcul des statistiques pour une demande: " + e.getMessage());
                }
            }

            return Map.of(
                    "totalDemandes", totalDemandes,
                    "demandesEnAttente", demandesEnAttente,
                    "demandesAcceptees", demandesAcceptees,
                    "demandesRefusees", demandesRefusees,
                    "montantTotal", montantTotal
            );
        } catch (Exception e) {
            return Map.of(
                    "totalDemandes", 0,
                    "demandesEnAttente", 0,
                    "demandesAcceptees", 0,
                    "demandesRefusees", 0,
                    "montantTotal", 0.0
            );
        }
    }

    @GetMapping("/{demandeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_IMPORTATEUR', 'ROLE_AGENT', 'ROLE_SUPERVISEUR')")
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> getDemandeDetail(@PathVariable Long demandeId) {
        try {
            Demande demande = demandeService.getDemandeWithDetails(demandeId);
            if (demande == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Demande non trouvée"));
            }

            initializeCollectionsSafely(demande);

            Map<String, Object> response = createDemandeDetailResponseSafely(demande);
            response.put("success", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération: " + e.getMessage()));
        }
    }

    @PostMapping("/global")
    @PreAuthorize("hasAuthority('ROLE_IMPORTATEUR')")
    @Transactional
    public ResponseEntity<?> createDemandeGlobal(
            @RequestParam("categorie") Categorie categorie,
            @RequestParam("bureauDouanierId") Long bureauDouanierId,
            @RequestParam("deviseId") Long deviseId,
            @RequestParam("excelFile") MultipartFile excelFile,
            @RequestParam("documents") List<MultipartFile> documents,
            Authentication auth) {

        try {
            Importateur importateur = importateurService.getImportateurByEmail(auth.getName());
            if (importateur == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Profil importateur non trouvé"));
            }

            BureauDouanier bureauDouanier = bureauDouanierService.getBureauById(bureauDouanierId);
            if (bureauDouanier == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Bureau douanier non trouvé"));
            }

            Devise devise = deviseService.getDeviseById(deviseId);
            if (devise == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Devise non trouvée"));
            }

            Demande demande = demandeService.createDemande(categorie, importateur, bureauDouanier, devise);

            try {
                List<Marchandise> marchandises = excelImportService.importMarchandisesFromExcel(excelFile);
                for (Marchandise marchandise : marchandises) {
                    demandeService.addMarchandise(demande.getId(), marchandise);
                }
            } catch (Exception e) {
                demandeService.deleteDemande(demande.getId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Erreur import Excel: " + e.getMessage()));
            }

            try {
                if (documents != null && !documents.isEmpty()) {
                    documentService.uploadMultipleDocuments(documents, demande);
                }
            } catch (Exception e) {
                demandeService.deleteDemande(demande.getId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(createErrorResponse("Erreur upload documents: " + e.getMessage()));
            }

            Demande demandeFinale = demandeService.soumetteDemande(demande.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande créée et soumise avec succès");
            response.put("numeroEnregistrement", demandeFinale.getNumeroEnregistrement());
            response.put("demande", createDemandeDetailResponseSafely(demandeFinale));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la création globale: " + e.getMessage()));
        }
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAnyAuthority('ROLE_IMPORTATEUR', 'ROLE_AGENT', 'ROLE_SUPERVISEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> downloadDocument(@PathVariable Long documentId, Authentication auth) {
        try {
            Optional<Document> documentOpt = documentService.getDocumentById(documentId);
            if (documentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Document non trouvé"));
            }

            Document document = documentOpt.get();

            if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_IMPORTATEUR"))) {
                Importateur importateur = importateurService.getImportateurByEmail(auth.getName());
                if (!document.getDemande().getImportateur().getId().equals(importateur.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(createErrorResponse("Accès refusé à ce document"));
                }
            }

            var fileStream = documentService.downloadDocument(documentId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getNom() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, document.getType())
                    .body(fileStream.readAllBytes());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors du téléchargement: " + e.getMessage()));
        }
    }

    @GetMapping("/template-excel")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = excelImportService.generateExcelTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "template_marchandises.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(template);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/reference/bureaux-douaniers")
    @PreAuthorize("hasAnyAuthority('ROLE_IMPORTATEUR', 'ROLE_AGENT', 'ROLE_SUPERVISEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBureauxDouaniers() {
        try {
            List<BureauDouanier> bureaux = bureauDouanierService.getAllBureaux();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", bureaux.stream().map(bureau -> Map.of(
                    "id", bureau.getId(),
                    "code", bureau.getCode(),
                    "description", bureau.getDescription()
            )).toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération des bureaux: " + e.getMessage()));
        }
    }

    @GetMapping("/reference/devises")
    @PreAuthorize("hasAnyAuthority('ROLE_IMPORTATEUR', 'ROLE_AGENT', 'ROLE_SUPERVISEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDevises() {
        try {
            List<Devise> devises = deviseService.getAllDevises();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", devises.stream().map(devise -> Map.of(
                    "id", devise.getId(),
                    "code", devise.getCode(),
                    "description", devise.getDescription()
            )).toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération des devises: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("timestamp", java.time.Instant.now().toString());
        return error;
    }

    private Map<String, Object> createDemandeResponseSafely(Demande demande) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("id", demande.getId());
            response.put("numeroEnregistrement", demande.getNumeroEnregistrement());
            response.put("statut", demande.getStatut() != null ? demande.getStatut().name() : "INCONNU");
            response.put("categorie", demande.getCategorie() != null ? demande.getCategorie().name() : "INCONNU");
            response.put("dateCreation", demande.getDateCreation());
            response.put("dateModification", demande.getDateModification());
            response.put("importateur", demande.getNomImportateur());
            try {
                response.put("nombreMarchandises", demande.getNombreMarchandises());
            } catch (Exception e) {
                response.put("nombreMarchandises", 0);
            }
            try {
                response.put("montantTotal", demande.getMontantTotal());
            } catch (Exception e) {
                response.put("montantTotal", 0.0);
            }
        } catch (Exception e) {
            response.put("id", demande.getId());
            response.put("numeroEnregistrement", "N/A");
            response.put("statut", "INCONNU");
            response.put("categorie", "INCONNU");
            response.put("dateCreation", new Date());
            response.put("importateur", "N/A");
            response.put("nombreMarchandises", 0);
            response.put("montantTotal", 0.0);
        }
        return response;
    }

    private Map<String, Object> createDemandeResponse(Demande demande) {
        return createDemandeResponseSafely(demande);
    }

    private Map<String, Object> createDemandeDetailResponseSafely(Demande demande) {
        Map<String, Object> response = createDemandeResponseSafely(demande);

        try {
            List<Marchandise> marchandises = demande.getMarchandises();
            response.put("marchandises", marchandises != null
                    ? marchandises.stream().map(this::createMarchandiseResponseSafely).toList()
                    : new ArrayList<>());
        } catch (Exception e) {
            response.put("marchandises", new ArrayList<>());
        }

        try {
            List<Document> documents = demande.getDocuments();
            response.put("documents", documents != null
                    ? documents.stream().map(this::createDocumentResponseSafely).toList()
                    : new ArrayList<>());
        } catch (Exception e) {
            response.put("documents", new ArrayList<>());
        }

        try {
            if (demande.getBureauDouanier() != null) {
                response.put("bureauDouanier", Map.of(
                        "id", demande.getBureauDouanier().getId(),
                        "code", demande.getBureauDouanier().getCode(),
                        "description", demande.getBureauDouanier().getDescription()
                ));
            }
        } catch (Exception e) {
            response.put("bureauDouanier", Map.of("id", 0L, "code", "N/A", "description", "N/A"));
        }

        try {
            if (demande.getDevise() != null) {
                response.put("devise", Map.of(
                        "id", demande.getDevise().getId(),
                        "code", demande.getDevise().getCode(),
                        "description", demande.getDevise().getDescription()
                ));
            }
        } catch (Exception e) {
            response.put("devise", Map.of("id", 0L, "code", "N/A", "description", "N/A"));
        }

        return response;
    }

    private Map<String, Object> createDemandeDetailResponse(Demande demande) {
        return createDemandeDetailResponseSafely(demande);
    }

    private Map<String, Object> createDemandeCompleteResponseSafely(Demande demande) {
        Map<String, Object> response = createDemandeDetailResponseSafely(demande);

        try {
            List<Marchandise> marchandises = demande.getMarchandises();
            if (marchandises != null && !marchandises.isEmpty()) {
                try {
                    double montantTotal = marchandises.stream()
                            .mapToDouble(m -> m.getMontant() != null ? m.getMontant() : 0.0)
                            .sum();
                    double quantiteTotale = marchandises.stream()
                            .mapToDouble(m -> m.getQuantite() != null ? m.getQuantite() : 0.0)
                            .sum();
                    double poidsNetTotal = marchandises.stream()
                            .mapToDouble(m -> m.getPoidsNet() != null ? m.getPoidsNet() : 0.0)
                            .sum();
                    double poidsBrutTotal = marchandises.stream()
                            .mapToDouble(m -> m.getPoidsBrut() != null ? m.getPoidsBrut() : 0.0)
                            .sum();

                    response.put("statistiquesMarchandises", Map.of(
                            "nombreMarchandises", marchandises.size(),
                            "montantTotal", montantTotal,
                            "quantiteTotale", quantiteTotale,
                            "poidsNetTotal", poidsNetTotal,
                            "poidsBrutTotal", poidsBrutTotal
                    ));
                } catch (Exception e) {
                    response.put("statistiquesMarchandises", createEmptyStatistiquesMarchandises());
                }
            } else {
                response.put("statistiquesMarchandises", createEmptyStatistiquesMarchandises());
            }
        } catch (Exception e) {
            response.put("statistiquesMarchandises", createEmptyStatistiquesMarchandises());
        }

        try {
            List<Document> documents = demande.getDocuments();
            if (documents != null && !documents.isEmpty()) {
                try {
                    long tailleTotal = documents.stream()
                            .mapToLong(doc -> doc.getTaille() != null ? doc.getTaille() : 0L)
                            .sum();

                    Map<String, Long> typesDocuments = documents.stream()
                            .filter(doc -> doc.getExtension() != null)
                            .collect(Collectors.groupingBy(
                                    Document::getExtension,
                                    Collectors.counting()
                            ));

                    response.put("statistiquesDocuments", Map.of(
                            "nombreDocuments", documents.size(),
                            "tailleTotale", tailleTotal,
                            "tailleTotaleFormatee", formatFileSize(tailleTotal),
                            "typesDocuments", typesDocuments
                    ));
                } catch (Exception e) {
                    response.put("statistiquesDocuments", createEmptyStatistiquesDocuments());
                }
            } else {
                response.put("statistiquesDocuments", createEmptyStatistiquesDocuments());
            }
        } catch (Exception e) {
            response.put("statistiquesDocuments", createEmptyStatistiquesDocuments());
        }

        try {
            response.put("actions", Map.of(
                    "peutModifier", demande.isModifiable(),
                    "peutSupprimer", demande.isModifiable(),
                    "peutTelecharger", true,
                    "peutVoir", true
            ));
        } catch (Exception e) {
            response.put("actions", Map.of(
                    "peutModifier", false,
                    "peutSupprimer", false,
                    "peutTelecharger", true,
                    "peutVoir", true
            ));
        }

        try {
            if (demande.getCommentaire() != null && !demande.getCommentaire().trim().isEmpty()) {
                response.put("commentaire", demande.getCommentaire());
            }
        } catch (Exception e) {
            // ignore
        }

        return response;
    }

    private Map<String, Object> createDemandeCompleteResponse(Demande demande) {
        return createDemandeCompleteResponseSafely(demande);
    }

    private Map<String, Object> createEmptyStatistiquesMarchandises() {
        return Map.of(
                "nombreMarchandises", 0,
                "montantTotal", 0.0,
                "quantiteTotale", 0.0,
                "poidsNetTotal", 0.0,
                "poidsBrutTotal", 0.0
        );
    }

    private Map<String, Object> createEmptyStatistiquesDocuments() {
        return Map.of(
                "nombreDocuments", 0,
                "tailleTotale", 0L,
                "tailleTotaleFormatee", "0 B",
                "typesDocuments", new HashMap<>()
        );
    }

    private Map<String, Object> createMarchandiseResponseSafely(Marchandise marchandise) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("id", marchandise.getId());
            response.put("designation", marchandise.getDesignation());
            response.put("quantite", marchandise.getQuantite());
            response.put("montant", marchandise.getMontant());
            response.put("codeSh", marchandise.getCodeSh());
            response.put("uniteMesure", marchandise.getUniteMesure());
            response.put("poidsNet", marchandise.getPoidsNet());
            response.put("poidsBrut", marchandise.getPoidsBrut());
            response.put("description", marchandise.getDescription());

            try {
                if (marchandise.getPays() != null) {
                    response.put("pays", Map.of(
                            "id", marchandise.getPays().getId(),
                            "code", marchandise.getPays().getCode(),
                            "description", marchandise.getPays().getDescription()
                    ));
                }
            } catch (Exception e) { /* ignore */ }
        } catch (Exception e) {
            response.put("id", marchandise.getId());
            response.put("designation", "N/A");
            response.put("quantite", 0.0);
            response.put("montant", 0.0);
            response.put("codeSh", "N/A");
        }
        return response;
    }

    private Map<String, Object> createMarchandiseResponse(Marchandise marchandise) {
        return createMarchandiseResponseSafely(marchandise);
    }

    private Map<String, Object> createDocumentResponseSafely(Document document) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("id", document.getId());
            response.put("nom", document.getNom());
            response.put("type", document.getType());
            response.put("taille", document.getTaille());
            response.put("tailleFormatee", document.getTailleFormatee());
            response.put("dateUpload", document.getDateUpload());
            response.put("extension", document.getExtension());
        } catch (Exception e) {
            response.put("id", document.getId());
            response.put("nom", "Document");
            response.put("type", "application/octet-stream");
            response.put("taille", 0L);
            response.put("tailleFormatee", "0 B");
            response.put("dateUpload", new Date());
            response.put("extension", "unknown");
        }
        return response;
    }

    private Map<String, Object> createDocumentResponse(Document document) {
        return createDocumentResponseSafely(document);
    }

    private String formatFileSize(long bytes) {
        try {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
            if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
            return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
        } catch (Exception e) {
            return "0 B";
        }
    }
}
