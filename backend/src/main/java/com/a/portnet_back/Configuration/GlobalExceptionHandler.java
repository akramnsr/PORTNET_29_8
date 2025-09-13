// backend/src/main/java/com/a/portnet_back/Configuration/GlobalExceptionHandler.java
package com.a.portnet_back.Configuration;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err("Fichier trop volumineux"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err("Requête invalide"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        ex.printStackTrace();
        // Montre le message exact pour faciliter le debug côté front
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(err("Erreur interne: " + ex.getClass().getSimpleName() + ": " + (ex.getMessage() == null ? "" : ex.getMessage())));
    }

    private Map<String,Object> err(String message) {
        return Map.of("success", false, "error", message, "timestamp", Instant.now().toString());
    }
}
