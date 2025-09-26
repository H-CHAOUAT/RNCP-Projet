package com.finfamplan.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // allow your frontend
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
