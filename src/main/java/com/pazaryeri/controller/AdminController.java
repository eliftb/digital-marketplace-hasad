package com.pazaryeri.controller;
import com.pazaryeri.dto.response.ApiResponse;
import com.pazaryeri.dto.response.AuthResponse;
import com.pazaryeri.dto.response.DashboardResponse;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import com.pazaryeri.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Yonetici islemleri")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/users")
    @Operation(summary = "Kullanicilar")
    public ResponseEntity<ApiResponse<PageResponse<AuthResponse.UserDto>>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(role, status, search, pageable)));
    }

    @PostMapping("/users/{userId}/ban")
    @Operation(summary = "Ban")
    public ResponseEntity<ApiResponse<String>> banUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        adminService.banUser(userId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.successMessage("Kullanici banlandi"));
    }

    @PostMapping("/users/{userId}/activate")
    @Operation(summary = "Aktifestir")
    public ResponseEntity<ApiResponse<String>> activateUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        adminService.activateUser(userId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.successMessage("Kullanici aktiflestirildi"));
    }

    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Kullanici rolunu degistir (sadece SUPER_ADMIN)")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> changeUserRole(
            @PathVariable Long userId,
            @RequestParam UserRole role,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.changeUserRole(userId, role, userDetails.getUsername())));
    }

    @GetMapping("/settings/{key}")
    @Operation(summary = "Ayar getir")
    public ResponseEntity<ApiResponse<String>> getSetting(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPlatformSetting(key)));
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Ayar guncelle")
    public ResponseEntity<ApiResponse<String>> updateSetting(
            @PathVariable String key,
            @RequestParam String value,
            @AuthenticationPrincipal UserDetails userDetails) {
        adminService.updatePlatformSetting(key, value, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.successMessage("Ayar guncellendi"));
    }
}
