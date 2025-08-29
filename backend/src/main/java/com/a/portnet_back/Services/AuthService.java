package com.a.portnet_back.Services;

import com.a.portnet_back.Enum.Role;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.Importateur;
import com.a.portnet_back.Models.User;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Repositories.ImportateurRepository;
import com.a.portnet_back.Repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final ImportateurRepository importateurRepository;

    public AuthService(UserRepository userRepository,
                       AgentRepository agentRepository,
                       ImportateurRepository importateurRepository) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.importateurRepository = importateurRepository;
    }

    // ------------------------------
    // UserDetailsService
    // ------------------------------
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .accountExpired(false)
                .accountLocked(!user.isEnabled())
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
    }

    // ------------------------------
    // Helpers basés sur le SecurityContext (JWT courant)
    // ------------------------------
    /** Renvoie l'email (username) de l'utilisateur authentifié. */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }
        return auth.getName();
    }

    /** Renvoie l'entité User correspondant au token courant. */
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String email = getCurrentUsername();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable: " + email));
    }

    /** Renvoie l'entité Agent liée au user courant (erreur si ce n'est pas un agent). */
    @Transactional(readOnly = true)
    public Agent getCurrentAgent() {
        User me = getCurrentUser();
        return agentRepository.findByUserId(me.getId())
                .orElseThrow(() -> new IllegalStateException("Profil agent introuvable pour l'utilisateur courant"));
    }

    // ------------------------------
    // Méthodes existantes utilitaires
    // ------------------------------
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public Importateur findImportateurByUserId(Long userId) {
        return importateurRepository.findByUserId(userId).orElse(null);
    }

    public Agent findAgentByUserId(Long userId) {
        return agentRepository.findByUserId(userId).orElse(null);
    }

    public User findSuperviseurByUserId(Long userId) {
        return userRepository.findById(userId)
                .filter(user -> user.getRole() == Role.SUPERVISEUR)
                .orElse(null);
    }

    public User createSuperviseur(String email, String password, String nomComplet) {
        User superviseur = new User(email, password, Role.SUPERVISEUR, nomComplet);
        return userRepository.save(superviseur);
    }

    public List<User> findAllSuperviseurs() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.SUPERVISEUR)
                .toList();
    }

    public List<Importateur> findAllImportateurs() {
        return importateurRepository.findAllWithUser();
    }

    public List<User> findAllImportateurUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.IMPORTATEUR)
                .toList();
    }

    public boolean isImportateur(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole() == Role.IMPORTATEUR)
                .orElse(false);
    }

    public boolean isSuperviseur(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole() == Role.SUPERVISEUR)
                .orElse(false);
    }

    public boolean isAgent(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole() == Role.AGENT)
                .orElse(false);
    }

    public Agent findAgentByEmail(String email) {
        User user = findByEmail(email);
        if (user != null && user.getRole() == Role.AGENT) {
            return findAgentByUserId(user.getId());
        }
        return null;
    }
}
