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
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class SuperAdminUserSeeder implements ApplicationRunner {

    private static final String SUPER_ADMIN_EMAIL    = "superadmin@pazaryeri.com";
    private static final String SUPER_ADMIN_PASSWORD = "SuperAdmin123!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        User superAdmin = userRepository.findByEmail(SUPER_ADMIN_EMAIL)
                .orElseGet(() -> User.builder()
                        .email(SUPER_ADMIN_EMAIL)
                        .firstName("Super")
                        .lastName("Admin")
                        .build());

        boolean newUser = superAdmin.getId() == null;
        boolean pwNeedsUpdate = superAdmin.getPassword() == null
                || !passwordEncoder.matches(SUPER_ADMIN_PASSWORD, superAdmin.getPassword());

        superAdmin.setPassword(pwNeedsUpdate
                ? passwordEncoder.encode(SUPER_ADMIN_PASSWORD)
                : superAdmin.getPassword());
        // SUPER_ADMIN — ek yetkiler: rol değiştirme (/admin/users/{id}/role)
        //               ve platform ayarları (/admin/settings/**)
        superAdmin.setRole(UserRole.SUPER_ADMIN);
        superAdmin.setStatus(AccountStatus.ACTIVE);
        superAdmin.setEmailVerified(true);

        userRepository.save(superAdmin);
        log.info("{} SUPER_ADMIN seed user: {}", newUser ? "Created" : "Verified", SUPER_ADMIN_EMAIL);
    }
}
