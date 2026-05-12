package com.pazaryeri.config;

import com.pazaryeri.entity.User;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import com.pazaryeri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeeder implements ApplicationRunner {

    private static final String ADMIN_EMAIL    = "admin@pazaryeri.com";
    private static final String ADMIN_PASSWORD = "Admin123!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        User admin = userRepository.findByEmail(ADMIN_EMAIL)
                .orElseGet(() -> User.builder()
                        .email(ADMIN_EMAIL)
                        .firstName("Platform")
                        .lastName("Yoneticisi")
                        .build());

        boolean newUser = admin.getId() == null;
        boolean pwNeedsUpdate = admin.getPassword() == null
                || !passwordEncoder.matches(ADMIN_PASSWORD, admin.getPassword());

        admin.setPassword(pwNeedsUpdate
                ? passwordEncoder.encode(ADMIN_PASSWORD)
                : admin.getPassword());
        // Normal ADMIN — erişim: tüm /admin/** sayfaları
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        admin.setEmailVerified(true);

        userRepository.save(admin);
        log.info("{} ADMIN seed user: {}", newUser ? "Created" : "Verified", ADMIN_EMAIL);
    }
}
