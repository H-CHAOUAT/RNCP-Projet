package com.finfamplan.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Builder
@Data
public class UserDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private BigDecimal salary;
    private BigDecimal balance;
}
