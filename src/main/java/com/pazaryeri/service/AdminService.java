package com.pazaryeri.service;

import com.pazaryeri.dto.response.DashboardResponse;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import org.springframework.data.domain.Pageable;
import com.pazaryeri.dto.response.AuthResponse;

public interface AdminService {
    DashboardResponse getDashboard();
    PageResponse<AuthResponse.UserDto> getAllUsers(UserRole role, AccountStatus status, String search, Pageable pageable);
    void banUser(Long userId, String adminEmail);
    void activateUser(Long userId, String adminEmail);
    AuthResponse.UserDto changeUserRole(Long userId, UserRole role, String adminEmail);
    void updatePlatformSetting(String key, String value, String adminEmail);
    String getPlatformSetting(String key);
}
