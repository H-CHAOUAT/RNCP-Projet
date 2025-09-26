package com.finfamplan.backend;

import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository) {
		return args -> {
			User u = new User();
			u.setFirstName("Hala");
			u.setLastName("CHAOUAT");
			u.setEmail("hala@test.com");
			u.setPassword("123456");
			u.setRole("parent");
			userRepository.save(u);
		};
	}
}

