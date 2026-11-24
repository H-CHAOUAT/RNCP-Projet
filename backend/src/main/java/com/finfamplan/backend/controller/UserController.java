package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.User;
import com.finfamplan.backend.dto.UpdateUserRequest;
import jakarta.validation.Valid;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.security.AccessGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccessGuard accessGuard;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, AccessGuard accessGuard) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accessGuard = accessGuard;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id, HttpServletRequest request) {
        accessGuard.requireSelf(request, id);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    @GetMapping("/family/{familyGroupId}")
    public List<User> getUsersByFamilyGroup(@PathVariable Long familyGroupId, HttpServletRequest request) {
        User caller = userRepository.findById(accessGuard.currentUserId(request))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Veuillez vous reconnecter"));
        if (caller.getFamilyGroup() == null || !caller.getFamilyGroup().getId().equals(familyGroupId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce foyer ne vous appartient pas");
        }
        return userRepository.findByFamilyGroup_Id(familyGroupId);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser, HttpServletRequest request) {
        accessGuard.requireSelf(request, id);
        return userRepository.findById(id).map(user -> {
            String newEmail = updatedUser.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet e-mail est déjà utilisé");
            }
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEmail(updatedUser.getEmail());
            return userRepository.save(user);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    @PutMapping("/{id}/password")
    public Map<String, String> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe actuel et le nouveau mot de passe sont requis");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Le mot de passe actuel est incorrect");
        }

        if (newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nouveau mot de passe doit contenir au moins 8 caractères");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of("message", "Mot de passe mis à jour avec succès");
    }

    @PostMapping("/{id}/logout-all")
    public Map<String, String> logoutAll(@PathVariable Long id, HttpServletRequest request) {
        accessGuard.requireSelf(request, id);
        userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        return Map.of("message", "Toutes les sessions ont été fermées. Reconnectez-vous sur chaque appareil.");
    }

    @PostMapping("/family/invite")
    public Map<String, Object> inviteToFamily(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long inviterUserId = Long.valueOf(body.get("inviterUserId").toString());
        accessGuard.requireSelf(request, inviterUserId);
        String email = body.get("email").toString().trim().toLowerCase();
        String roleStr = body.get("role").toString().toUpperCase();

        User inviter = userRepository.findById(inviterUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur invitant introuvable"));

        if (inviter.getFamilyGroup() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous n'appartenez à aucun foyer");
        }

        User invitee = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucun compte trouvé pour l'adresse " + email + ". Cette personne doit d'abord s'inscrire."));

        invitee.setFamilyGroup(inviter.getFamilyGroup());

        try {
            com.finfamplan.backend.model.Role role = com.finfamplan.backend.model.Role.valueOf(roleStr);
            invitee.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle invalide : " + roleStr);
        }

        userRepository.save(invitee);

        return Map.of(
                "success", true,
                "message", invitee.getFirstName() + " " + invitee.getLastName() + " a été ajouté(e) à votre foyer."
        );
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id, HttpServletRequest request) {
        accessGuard.requireSelf(request, id);
        userRepository.deleteById(id);
    }
}
