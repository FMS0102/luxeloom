package com.fms.backend.config;

import com.fms.backend.models.Role;
import com.fms.backend.models.User;
import com.fms.backend.repositories.RoleRepository;
import com.fms.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

@Configuration
public class AdminUserConfig implements CommandLineRunner {

    private final Environment env;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminUserConfig(Environment env, RoleRepository roleRepository, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.env = env;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private final Logger logger = LoggerFactory.getLogger(AdminUserConfig.class);

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        var roleAdmin = roleRepository.findByName(Role.Values.ADMIN.name());
        var userAdmin = userRepository.findByEmail(env.getProperty("ADMIN_EMAIL"));


        userAdmin.ifPresentOrElse(
                user -> {
                    logger.info("AdminUserConfig: admin already exists '{}'", user.getEmail());
                },
                () -> {
                    var user = new User();
                    user.setName(env.getProperty("ADMIN_USER"));
                    user.setEmail(env.getProperty("ADMIN_EMAIL"));
                    user.setPassword(passwordEncoder.encode(env.getProperty("ADMIN_PASS")));
                    user.setRoles(Set.of(roleAdmin));
                    userRepository.save(user);

                    logger.info("AdminUserConfig: admin created '{}'", user.getEmail());
                });
    }


}
