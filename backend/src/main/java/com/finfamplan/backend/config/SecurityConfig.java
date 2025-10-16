package com.finfamplan.backend.config;

import com.finfamplan.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for testing via Swagger
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",          // ✅ Allow login/register
                                "/swagger-ui/**",        // ✅ Allow Swagger UI
                                "/v3/api-docs/**",       // ✅ Allow API docs
                                "/swagger-resources/**", // ✅ Allow Swagger resources
                                "/webjars/**"            // ✅ Allow static Swagger assets
                        ).permitAll()
                        .anyRequest().permitAll()   // temporarily allow all for testing
                )
                .httpBasic(httpBasic -> httpBasic.disable()) // disable basic auth
                .formLogin(form -> form.disable());          // disable form login

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new Argon2PasswordEncoder(
                16, 32, 1, 65536, 3
        );
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByEmail(username)
                .map(user -> User.withUsername(user.getEmail())
                        .password(user.getPassword())  // already encoded in DB
                        .roles(user.getRole().name())  // use your Role enum
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
