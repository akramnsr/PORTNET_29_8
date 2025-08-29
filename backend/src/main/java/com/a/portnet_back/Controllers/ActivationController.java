package com.a.portnet_back.Controllers;

import com.a.portnet_back.Models.User;
import com.a.portnet_back.Models.VerificationToken;
import com.a.portnet_back.Repositories.UserRepository;
import com.a.portnet_back.Repositories.VerificationTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.a.portnet_back.DTO.ActivationResponse;
import java.time.LocalDateTime;
import java.util.Optional;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class ActivationController {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    public ActivationController(VerificationTokenRepository tokenRepository,
                                UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }



    @GetMapping("/activation")
    public ResponseEntity<?> activerCompte(@RequestParam("token") String token) {
        System.out.println("=== DÉBUT ACTIVATION ===");
        System.out.println("Token reçu: " + token);

        Optional<VerificationToken> optionalToken = tokenRepository.findByToken(token);
        System.out.println("Token trouvé en base: " + optionalToken.isPresent());

        if (optionalToken.isEmpty()) {
            System.out.println("ERREUR: Token non trouvé");
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ActivationResponse("Token invalide"));
        }

        VerificationToken verificationToken = optionalToken.get();
        System.out.println("Date expiration: " + verificationToken.getExpiration());
        System.out.println("Date actuelle: " + LocalDateTime.now());
        System.out.println("Token expiré: " + verificationToken.getExpiration().isBefore(LocalDateTime.now()));

        if (verificationToken.getExpiration().isBefore(LocalDateTime.now())) {
            System.out.println("ERREUR: Token expiré");
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ActivationResponse("Token expiré"));
        }

        User user = verificationToken.getUser();
        System.out.println("Utilisateur trouvé: " + user.getEmail());
        System.out.println("Utilisateur activé avant: " + user.isEnabled());

        user.setEnabled(true);
        userRepository.save(user);
        System.out.println("Utilisateur sauvegardé");

        tokenRepository.delete(verificationToken);
        System.out.println("Token supprimé");

        System.out.println("=== FIN ACTIVATION SUCCÈS ===");
        return ResponseEntity.ok(new ActivationResponse("Compte activé avec succès"));
    }


}
