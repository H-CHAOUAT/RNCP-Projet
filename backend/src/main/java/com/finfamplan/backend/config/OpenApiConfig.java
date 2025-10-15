package com.finfamplan.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI finfamOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FinFamPlan API")
                        .description("Backend API for family finance planner")
                        .version("1.0.0"));
    }
}
