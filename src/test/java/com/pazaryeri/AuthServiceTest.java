package com.pazaryeri;

import com.pazaryeri.dto.request.AuthRequest;
import com.pazaryeri.dto.response.AuthResponse;
import com.pazaryeri.entity.User;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.repository.PasswordResetTokenRepository;
import com.pazaryeri.repository.RefreshTokenRepository;
import com.pazaryeri.repository.UserRepository;
import com.pazaryeri.security.JwtService;
import com.pazaryeri.security.UserDetailsServiceImpl;
import com.pazaryeri.service.EmailService;
import com.pazaryeri.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private UserDetailsServiceImpl userDetailsService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
    }

    @Test
    void register_whenEmailNotExists_shouldReturnAuthResponse() {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("test@example.com");
        request.setPassword("Test123!");
        request.setFirstName("Test");
        request.setLastName("User");

        User savedUser = User.builder()
                .id(1L).email("test@example.com")
                .firstName("Test").lastName("User")
                .role(UserRole.CONSUMER).status(AccountStatus.ACTIVE)
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(userDetailsService.loadUserByUsername(anyString()))
                .thenReturn(org.springframework.security.core.userdetails.User
                        .withUsername("test@example.com").password("encoded")
                        .authorities("ROLE_CONSUMER").build());
        when(jwtService.generateToken(any(), any())).thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        verify(userRepository).save(any());
        verify(emailService).sendWelcomeEmail("test@example.com", "Test User");
    }

    @Test
    void register_whenEmailExists_shouldThrowBusinessException() {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("existing@example.com");
        request.setPassword("Test123!");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BusinessException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }
}
