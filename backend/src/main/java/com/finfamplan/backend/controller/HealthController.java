package com.finfamplan.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "OK",
                "service", "FinFamPlan Backend",
                "time", Instant.now().toString()
        );
    }
}
