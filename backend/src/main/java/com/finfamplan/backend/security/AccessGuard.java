package com.finfamplan.backend.security;

import com.finfamplan.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Guards against IDOR (Insecure Direct Object Reference): a controller must
 * never trust a userId coming from the URL or the request body on its own.
 * It must check it against the identity carried by the caller's own JWT.
 *
 * Usage: call requireSelf(request, pathUserId) as the first line of any
 * endpoint that reads or writes data scoped to one userId.
 */
@Component
public class AccessGuard {

    private final JwtService jwtService;

    public AccessGuard(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /** The id of the user the JWT was issued to. */
    public Long currentUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }

        Long userId;
        try {
            userId = jwtService.extractUserId(header.substring(7));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        if (userId == null) {
            // Token issued before the userId claim existed: force a re-login
            // instead of silently trusting the URL.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again");
        }
        return userId;
    }

    /** Throws 403 unless the caller IS userId. */
    public void requireSelf(HttpServletRequest request, Long userId) {
        if (userId == null || !currentUserId(request).equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your resource");
        }
    }
}
