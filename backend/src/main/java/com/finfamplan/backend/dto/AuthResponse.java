package com.finfamplan.backend.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AuthResponse {
    private String status;  // "OK" | "ERROR"
    private String message; // e.g. "Logged in" or error text
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private String refreshToken;

}
