// package com.a.portnet_back;

// import com.a.portnet_back.Enum.Role;
// import com.a.portnet_back.Models.Superviseur;
// import com.a.portnet_back.Models.User;
// import com.a.portnet_back.Repositories.SuperviseurRepository;
// import com.a.portnet_back.Repositories.UserRepository;
// import org.springframework.boot.context.event.ApplicationReadyEvent;
// import org.springframework.context.event.EventListener;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// @Component
// public class SuperviseurInitializer {

//     private final UserRepository userRepository;
//     private final SuperviseurRepository superviseurRepository;
//     private final PasswordEncoder passwordEncoder;
//     private final SuperviseurConfig superviseurConfig;

//     public SuperviseurInitializer(UserRepository userRepository,
//                                   SuperviseurRepository superviseurRepository,
//                                   PasswordEncoder passwordEncoder,
//                                   SuperviseurConfig superviseurConfig) {
//         this.userRepository = userRepository;
//         this.superviseurRepository = superviseurRepository;
//         this.passwordEncoder = passwordEncoder;
//         this.superviseurConfig = superviseurConfig;
//     }

//     @EventListener(ApplicationReadyEvent.class)
//     public void initSuperviseur() {
//         String email = superviseurConfig.getEmail();
//         String rawPassword = superviseurConfig.getPassword();

//         if (!userRepository.findByEmail(email).isPresent()) {
//             // Créer user superviseur
//             User superviseurUser = new User();
//             superviseurUser.setEmail(email);
//             superviseurUser.setPassword(passwordEncoder.encode(rawPassword));
//             superviseurUser.setRole(Role.SUPERVISEUR);
//             superviseurUser.setEnabled(true);
//             userRepository.save(superviseurUser);

//             // Créer entité superviseur liée
//             Superviseur superviseur = new Superviseur();
//             superviseur.setUser(superviseurUser);
//             superviseur.setNomComplet("Superviseur Principal"); // ou autre nom
//             superviseurRepository.save(superviseur);

//             System.out.println("Superviseur initialisé en base avec email : " + email);
//         } else {
//             System.out.println("Superviseur déjà existant en base.");
//         }
//     }
// }
