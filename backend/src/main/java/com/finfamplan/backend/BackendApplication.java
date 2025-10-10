package com.finfamplan.backend;

import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository, PasswordEncoder encoder) {
		return args -> {
			// Create hala if not exists
			if (!userRepository.existsByEmail("hala@test.com")) {
				User u = new User();
				u.setFirstName("Hala");
				u.setLastName("CHAOUAT");
				u.setEmail("hala@test.com");
				u.setPassword(encoder.encode("123456")); // encode!
				u.setRole(Role.PARENT);
				userRepository.save(u);
			}

			// Create admin if not exists
			if (!userRepository.existsByEmail("admin@test.com")) {
				User admin = new User();
				admin.setFirstName("System");
				admin.setLastName("Admin");
				admin.setEmail("admin@test.com");
				admin.setPassword(encoder.encode("secret123")); // encode!
				admin.setRole(Role.ADMIN);
				userRepository.save(admin);
			}
		};
	}

}

