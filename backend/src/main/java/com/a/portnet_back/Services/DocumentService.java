package com.a.portnet_back.Services;

import com.a.portnet_back.Models.Demande;
import com.a.portnet_back.Models.Document;
import com.a.portnet_back.Repositories.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final S3Service s3Service;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/csv"
    );


    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public DocumentService(DocumentRepository documentRepository, S3Service s3Service) {
        this.documentRepository = documentRepository;
        this.s3Service = s3Service;
    }


    @Transactional
    public Document uploadDocument(MultipartFile file, Demande demande) {
        try {
            validateFile(file);


            if (!demande.isModifiable()) {
                throw new RuntimeException("Cette demande ne peut plus être modifiée");
            }
            String s3Key = s3Service.uploadFile(
                    file,
                    demande.getImportateur().getId(),
                    demande.getCategorie().name(),
                    demande.getNumeroEnregistrement()
            );

            Document document = new Document();
            document.setNom(file.getOriginalFilename());
            document.setChemin(s3Key);
            document.setType(file.getContentType());
            document.setTaille(file.getSize());
            document.setDemande(demande);

            Document savedDocument = documentRepository.save(document);


            demande.markAsModified();

            return savedDocument;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'upload du document: " + e.getMessage(), e);
        }
    }


    @Transactional
    public List<Document> uploadMultipleDocuments(List<MultipartFile> files, Demande demande) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier à uploader");
        }

        int currentDocumentsCount = getDocumentsByDemande(demande.getId()).size();
        int newDocumentsCount = files.size();

        if (currentDocumentsCount + newDocumentsCount > 20) {
            throw new RuntimeException("Limite de 20 documents par demande dépassée");
        }

        return files.stream()
                .filter(file -> !file.isEmpty()) // Filtrer les fichiers vides
                .map(file -> uploadDocument(file, demande))
                .toList();
    }

    public ResponseInputStream<GetObjectResponse> downloadDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé avec l'ID: " + documentId));

        if (!s3Service.fileExists(document.getChemin())) {
            throw new RuntimeException("Le fichier n'existe plus dans le stockage cloud");
        }

        return s3Service.downloadFile(document.getChemin());
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé avec l'ID: " + documentId));


        if (!document.getDemande().isModifiable()) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        try {

            if (s3Service.fileExists(document.getChemin())) {
                s3Service.deleteFile(document.getChemin());
            }
        } catch (Exception e) {

            System.err.println("Erreur lors de la suppression S3: " + e.getMessage());
        }


        documentRepository.delete(document);


        document.getDemande().markAsModified();
    }

    @Transactional
    public void deleteAllDocumentsByDemande(Long demandeId) {
        List<Document> documents = getDocumentsByDemande(demandeId);

        for (Document document : documents) {
            try {
                if (s3Service.fileExists(document.getChemin())) {
                    s3Service.deleteFile(document.getChemin());
                }
            } catch (Exception e) {
                System.err.println("Erreur suppression S3 pour " + document.getNom() + ": " + e.getMessage());
            }
        }

        documentRepository.deleteByDemandeId(demandeId);
    }


    public List<Document> getDocumentsByDemande(Long demandeId) {
        return documentRepository.findByDemandeIdOrderByDateUploadDesc(demandeId);
    }

    public List<Document> getDocumentsByType(Long demandeId, String type) {
        return documentRepository.findByDemandeIdAndTypeOrderByDateUploadDesc(demandeId, type);
    }


    public Optional<Document> getDocumentById(Long documentId) {
        return documentRepository.findById(documentId);
    }

    public boolean hasRequiredDocuments(Demande demande) {
        List<Document> documents = getDocumentsByDemande(demande.getId());

        // Logique métier selon la catégorie
        switch (demande.getCategorie()) {
            case IMPORTATION:
                return hasImportationDocuments(documents);
            case EXPORTATION:
                return hasExportationDocuments(documents);
            default:
                return !documents.isEmpty();
        }
    }

    private boolean hasImportationDocuments(List<Document> documents) {
        if (documents.isEmpty()) return false;


        boolean hasInvoice = documents.stream()
                .anyMatch(doc -> doc.getNom().toLowerCase().contains("facture") ||
                        doc.getNom().toLowerCase().contains("invoice"));

        return hasInvoice;
    }

    private boolean hasExportationDocuments(List<Document> documents) {
        if (documents.isEmpty()) return false;

        return documents.size() >= 1;
    }


    public S3Service.FileInfo getDocumentInfo(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé avec l'ID: " + documentId));

        return s3Service.getFileInfo(document.getChemin());
    }

    public String getDownloadUrl(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        return s3Service.getFileUrl(document.getChemin());
    }


    public List<Document> searchDocumentsByName(Long demandeId, String searchTerm) {
        return documentRepository.findByDemandeIdAndNomContainingIgnoreCase(demandeId, searchTerm);
    }

    public long getTotalDocumentsSize(Long demandeId) {
        return documentRepository.findByDemandeId(demandeId)
                .stream()
                .mapToLong(doc -> doc.getTaille() != null ? doc.getTaille() : 0L)
                .sum();
    }


    public boolean isStorageQuotaExceeded(Long demandeId, long newFileSize) {
        long currentSize = getTotalDocumentsSize(demandeId);
        long maxQuota = 100 * 1024 * 1024;

        return (currentSize + newFileSize) > maxQuota;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide ou null");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("Le fichier est trop volumineux (max %.1f MB)", MAX_FILE_SIZE / (1024.0 * 1024.0))
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Type de fichier non autorisé. Types acceptés: PDF, Excel, Word, Images (JPG, PNG)"
            );
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du fichier est invalide");
        }


        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IllegalArgumentException("Le nom du fichier contient des caractères non autorisés");
        }


        if (!filename.contains(".")) {
            throw new IllegalArgumentException("Le fichier doit avoir une extension");
        }
    }

    public List<String> getRecommendedDocumentTypes(Demande demande) {
        switch (demande.getCategorie()) {
            case IMPORTATION:
                return Arrays.asList(
                        "Facture commerciale",
                        "Bon de livraison",
                        "Certificat d'origine",
                        "Liste de colisage",
                        "Connaissement"
                );
            case EXPORTATION:
                return Arrays.asList(
                        "Facture d'exportation",
                        "Certificat d'origine",
                        "Liste de colisage",
                        "Licence d'exportation"
                );
            default:
                return Arrays.asList("Document requis");
        }
    }
}