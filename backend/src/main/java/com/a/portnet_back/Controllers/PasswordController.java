// src/main/java/com/a/portnet_back/Controllers/PasswordController.java
package com.a.portnet_back.Controllers;

import com.a.portnet_back.DTO.ChangePasswordRequest;
import com.a.portnet_back.Models.User;
import com.a.portnet_back.Repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class PasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/api/auth/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePasswordAuth(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ChangePasswordRequest body) {
        return changePasswordInternal(principal, body);
    }

    @RequestMapping(path = "/api/users/me/password", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePasswordMe(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ChangePasswordRequest body) {
        return changePasswordInternal(principal, body);
    }

    private ResponseEntity<?> changePasswordInternal(UserDetails principal, ChangePasswordRequest body) {
        if (principal == null) return ResponseEntity.status(401).body("Non authentifié");

        // Unifier les différents noms de champs
        String current = body.getCurrentPassword() != null ? body.getCurrentPassword() : body.getOldPassword();
        String next    = body.getNewPassword()     != null ? body.getNewPassword()     : body.getPassword();
        String confirm = body.getConfirmPassword() != null ? body.getConfirmPassword() : next;

        if (next == null || next.length() < 6)
            return ResponseEntity.badRequest().body("Nouveau mot de passe trop court (min 6 caractères).");
        if (!next.equals(confirm))
            return ResponseEntity.badRequest().body("La confirmation ne correspond pas.");

        String email = principal.getUsername(); // chez toi, l'username = email
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("Utilisateur introuvable");

        if (current == null || !passwordEncoder.matches(current, user.getPassword()))
            return ResponseEntity.badRequest().body("Mot de passe actuel incorrect.");

        user.setPassword(passwordEncoder.encode(next));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié"));
    }
}
