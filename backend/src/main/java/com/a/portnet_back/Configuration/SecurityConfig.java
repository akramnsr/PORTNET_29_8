// src/main/java/com/a/portnet_back/Configuration/SecurityConfig.java
package com.a.portnet_back.Configuration;

import com.a.portnet_back.Services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired private JwtAuthFilter jwtAuthFilter;
    @Autowired private CustomUserDetailsService userDetailsService;
    @Autowired private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/whoami",
                                "/api/auth/activation",
                                "/api/agents/activation",
                                "/api/importateur/register",
                                "/api/demandes/template-excel",
                                "/error"
                        ).permitAll()

                        // workload / journal / bulk
                        .requestMatchers(HttpMethod.GET,  "/api/agents/workload/**").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers(HttpMethod.GET,  "/api/dispatch/journal/**").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers(HttpMethod.POST, "/api/dossiers/bulk-reassign").hasAuthority("ROLE_SUPERVISEUR")

                        .requestMatchers(HttpMethod.POST, "/api/dispatch/run").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers("/api/dispatch/**").authenticated()

                        .requestMatchers("/api/demandes/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/agents").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers(HttpMethod.GET,  "/api/importateur/all").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers(HttpMethod.GET,  "/api/importateur/{id}").hasAuthority("ROLE_SUPERVISEUR")
                        .requestMatchers(HttpMethod.GET,  "/api/agents").hasAnyAuthority("ROLE_SUPERVISEUR", "ROLE_AGENT")
                        .requestMatchers("/api/agents/**").hasAnyAuthority("ROLE_SUPERVISEUR", "ROLE_AGENT")
                        .requestMatchers("/api/agent/**").hasAuthority("ROLE_AGENT")
                        .requestMatchers("/api/importateur/**").hasAuthority("ROLE_IMPORTATEUR")

                        .requestMatchers("/api/tasks/**").authenticated()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception { return config.getAuthenticationManager(); }
    @Bean public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }
}
