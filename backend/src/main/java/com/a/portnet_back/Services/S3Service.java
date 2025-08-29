package com.a.portnet_back.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }


    public String uploadFile(MultipartFile file, Long importateurId, String categorie, String numeroEnregistrement) {
        try {

            String key = generateS3Key(importateurId, categorie, numeroEnregistrement, file.getOriginalFilename());


            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return key;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload du fichier: " + e.getMessage(), e);
        }
    }


    public ResponseInputStream<GetObjectResponse> downloadFile(String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.getObject(getObjectRequest);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du téléchargement: " + e.getMessage(), e);
        }
    }


    public void deleteFile(String key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
        }
    }


    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la vérification: " + e.getMessage(), e);
        }
    }


    public String getFileUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, "eu-north-1", key);
    }

    private String generateS3Key(Long importateurId, String categorie, String numeroEnregistrement, String originalFilename) {

        String cleanFilename = cleanFilename(originalFilename);


        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFilename = timestamp + "_" + cleanFilename;

        return String.format("%d/%s/%s/%s",
                importateurId,
                categorie.toLowerCase(),
                numeroEnregistrement,
                uniqueFilename);
    }


    private String cleanFilename(String filename) {
        if (filename == null) {
            return "document_" + UUID.randomUUID().toString().substring(0, 8);
        }


        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }


    public FileInfo getFileInfo(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headRequest);

            return new FileInfo(
                    key,
                    response.contentLength(),
                    response.contentType(),
                    response.lastModified()
            );

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des infos: " + e.getMessage(), e);
        }
    }

    public static class FileInfo {
        private final String key;
        private final Long size;
        private final String contentType;
        private final java.time.Instant lastModified;

        public FileInfo(String key, Long size, String contentType, java.time.Instant lastModified) {
            this.key = key;
            this.size = size;
            this.contentType = contentType;
            this.lastModified = lastModified;
        }

        public String getKey() { return key; }
        public Long getSize() { return size; }
        public String getContentType() { return contentType; }
        public java.time.Instant getLastModified() { return lastModified; }
    }
}