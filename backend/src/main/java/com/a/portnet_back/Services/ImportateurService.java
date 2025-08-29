package com.a.portnet_back.Services;

import com.a.portnet_back.DTO.ImportateurRequestDTO;
import com.a.portnet_back.Enum.Role;
import com.a.portnet_back.Models.Importateur;
import com.a.portnet_back.Models.User;
import com.a.portnet_back.Models.VerificationToken;
import com.a.portnet_back.Repositories.ImportateurRepository;
import com.a.portnet_back.Repositories.UserRepository;
import com.a.portnet_back.Repositories.VerificationTokenRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ImportateurService {

    private final ImportateurRepository importateurRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    public ImportateurService(ImportateurRepository importateurRepository,
                              UserRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              VerificationTokenRepository verificationTokenRepository,
                              EmailService emailService) {
        this.importateurRepository = importateurRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }

    public Importateur getImportateurConnecte() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return importateurRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Importateur non trouvé"));
    }


    public Importateur getImportateurByEmail(String email) {
        return importateurRepository.findByUserEmail(email).orElse(null);
    }


    public Importateur getImportateurByEmailRequired(String email) {
        return importateurRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Profil importateur non trouvé pour l'email: " + email));
    }

    public Importateur enregistrerImportateur(ImportateurRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email)) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }

        User user = new User();
        user.setEmail(dto.email);
        user.setPassword(passwordEncoder.encode(dto.password));
        user.setRole(Role.IMPORTATEUR);
        user.setEnabled(false);
        userRepository.save(user);

        Importateur importateur = new Importateur();
        importateur.setNomComplet(dto.nomComplet);
        importateur.setSociete(dto.societe);
        importateur.setTelephone(dto.telephone);
        importateur.setAdresse(dto.adresse);
        importateur.setVille(dto.ville);
        importateur.setPays(dto.pays);
        importateur.setRc(dto.rc);
        importateur.setIce(dto.ice);
        importateur.setIfiscale(dto.ifiscale);
        importateur.setPatente(dto.patente);
        importateur.setEmailProfessionnel(dto.emailProfessionnel);
        importateur.setDomaineActivite(dto.domaineActivite);
        importateur.setTypeOperation(dto.typeOperation);
        importateur.setCertifieISO(dto.certifieISO);
        importateur.setStatutDouanier(dto.statutDouanier);
        importateur.setUser(user);

        importateurRepository.save(importateur);

        String token = UUID.randomUUID().toString();
        VerificationToken vToken = new VerificationToken(token, user, LocalDateTime.now().plusHours(24));
        verificationTokenRepository.save(vToken);

        String activationLink = "http://localhost:3000/activation?token=" + token;
        emailService.sendEmail(user.getEmail(), "Activation de votre compte importateur",
                "Bonjour,\n\nCliquez sur le lien suivant pour activer votre compte importateur :\n" + activationLink +
                        "\n\nCe lien expire dans 24h.\n\nMerci.");

        return importateur;
    }

    public List<Importateur> getAllImportateurs() {
        return importateurRepository.findAllWithUser();
    }

    public Importateur findById(Long id) {
        return importateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Importateur non trouvé avec l'ID: " + id));
    }

    public Importateur findByUserId(Long userId) {
        return importateurRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Importateur non trouvé pour l'utilisateur: " + userId));
    }


    public boolean existsByEmail(String email) {
        return importateurRepository.findByUserEmail(email).isPresent();
    }

    public List<Importateur> searchImportateurs(String searchTerm) {
        return importateurRepository.findByNomCompletContainingIgnoreCaseOrSocieteContainingIgnoreCase(
                searchTerm, searchTerm);
    }

    public Importateur saveImportateur(Importateur importateur) {
        return importateurRepository.save(importateur);
    }
}