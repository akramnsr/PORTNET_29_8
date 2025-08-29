package com.a.portnet_back.Services;

import com.a.portnet_back.DTO.AgentActivationRequest;
import com.a.portnet_back.DTO.AgentDTO;
import com.a.portnet_back.DTO.AgentLogDTO;
import com.a.portnet_back.DTO.AgentRequest;
import com.a.portnet_back.Models.Agent;
import com.a.portnet_back.Models.User;
import com.a.portnet_back.Enum.Role;
import com.a.portnet_back.Repositories.AgentRepository;
import com.a.portnet_back.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AgentService {

    @Autowired private AgentRepository agentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String baseFrontendUrl = System.getenv("FRONTEND_URL") != null
            ? System.getenv("FRONTEND_URL")
            : "http://localhost:3000";

    public Agent createAgent(AgentRequest request, Long superviseurId) {
        if (agentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un agent avec cet email existe déjà.");
        }

        Agent agent = new Agent(
                request.getNomComplet(),
                request.getEmail(),
                request.getTelephone(),
                request.getDepartement()
        );

        String token = UUID.randomUUID().toString();
        agent.setActivationToken(token);
        agent.setActivated(false);
        if (superviseurId != null) agent.setSuperviseurId(superviseurId);

        Agent savedAgent = agentRepository.save(agent);

        // (optionnel) webhook d’envoi du mail d’activation
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("nom", agent.getNomComplet());
            payload.put("email", agent.getEmail());
            payload.put("token", token);
            payload.put("activationLink", baseFrontendUrl + "/agent/activate?token=" + token);
            restTemplate.postForEntity("http://localhost:5678/webhook/invite-agent", payload, String.class);
        } catch (Exception ignored) {}

        return savedAgent;
    }

    public boolean activateAgent(AgentActivationRequest request) {
        Optional<Agent> optionalAgent = agentRepository.findByActivationToken(request.getToken());
        if (optionalAgent.isEmpty()) return false;

        Agent agent = optionalAgent.get();
        if (agent.isActivated()) return false;

        User user = new User();
        user.setEmail(agent.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.AGENT);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        agent.setUser(savedUser);
        agent.setActivated(true);
        agent.setActivationToken(null);
        agentRepository.save(agent);
        return true;
    }

    public List<AgentDTO> getAllAgents() {
        List<Agent> agents = agentRepository.findAllWithUser();
        return agents.stream()
                .map(agent -> new AgentDTO(
                        agent.getId(),
                        agent.getNomComplet(),
                        agent.getEmail(),
                        agent.isEnabled(), // expose l’état réel du user
                        agent.getLastLogin()
                ))
                .collect(Collectors.toList());
    }

    public List<AgentLogDTO> getAgentsWithLastConnection() {
        List<Agent> agents = agentRepository.findAll();
        List<AgentLogDTO> list = new ArrayList<>();
        for (Agent a : agents) {
            User u = a.getUser();
            if (u != null) {
                AgentLogDTO dto = new AgentLogDTO();
                dto.setId(a.getId());
                dto.setNomComplet(a.getNomComplet());
                dto.setEmail(u.getEmail());
                dto.setEnabled(u.isEnabled());
                dto.setLastLogin(u.getLastLogin());
                list.add(dto);
            }
        }
        return list;
    }

    public boolean toggleAgentActivation(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        User user = agent.getUser();
        if (user == null) throw new RuntimeException("L'agent n'a pas de compte utilisateur associé");

        boolean newState = !user.isEnabled();
        user.setEnabled(newState);
        userRepository.save(user);
        return newState;
    }

    /** NOUVEAU : supprime l’agent ET le user associé */
    @Transactional
    public void deleteAgent(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        User user = agent.getUser();
        // on brise d’abord la FK pour éviter les contraintes
        agent.setUser(null);
        agentRepository.save(agent);

        if (user != null) {
            userRepository.delete(user);
        }
        agentRepository.delete(agent);
    }
}
