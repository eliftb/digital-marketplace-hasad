package com.pazaryeri.controller;

import com.pazaryeri.dto.response.ApiResponse;
import com.pazaryeri.entity.Category;
import com.pazaryeri.entity.City;
import com.pazaryeri.repository.CategoryRepository;
import com.pazaryeri.repository.CityRepository;
import com.pazaryeri.repository.DistrictRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LookupController {

    private final CategoryRepository categoryRepository;
    private final CityRepository cityRepository;
    private final DistrictRepository districtRepository;

    @GetMapping("/categories")
    @Tag(name = "Kategoriler")
    @Operation(summary = "Ana kategoriler")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> categories = categoryRepository.findByParentIsNullAndActiveTrueOrderBySortOrderAsc();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    @Tag(name = "Kategoriler")
    @Operation(summary = "Kategori ekle (Admin)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Kategori adı boş olamaz");
        }
        // Slug oluştur
        String slug = name.toLowerCase()
            .replace("ğ", "g").replace("ü", "u").replace("ş", "s")
            .replace("ı", "i").replace("ö", "o").replace("ç", "c")
            .replaceAll("\\s+", "-").replaceAll("[^a-z0-9-]", "");

        // Slug çakışması varsa suffix ekle
        String baseSlug = slug;
        int suffix = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + suffix++;
        }

        Category category = Category.builder()
            .name(name)
            .slug(slug)
            .active(true)
            .sortOrder(0)
            .build();

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @DeleteMapping("/categories/{id}")
    @Tag(name = "Kategoriler")
    @Operation(summary = "Kategori sil (Admin)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        categoryRepository.findById(id).ifPresent(c -> {
            c.setActive(false);
            categoryRepository.save(c);
        });
        return ResponseEntity.ok(ApiResponse.successMessage("Kategori silindi"));
    }

    @GetMapping("/categories/{id}/children")
    @Tag(name = "Kategoriler")
    @Operation(summary = "Alt kategoriler")
    public ResponseEntity<ApiResponse<List<Category>>> getSubCategories(@PathVariable Long id) {
        List<Category> subs = categoryRepository.findByParentIdAndActiveTrueOrderBySortOrderAsc(id);
        return ResponseEntity.ok(ApiResponse.success(subs));
    }

    @GetMapping("/cities")
    @Tag(name = "Konum")
    @Operation(summary = "Şehirler listesi")
    public ResponseEntity<ApiResponse<List<City>>> getCities() {
        return ResponseEntity.ok(ApiResponse.success(cityRepository.findAllByOrderByNameAsc()));
    }

    @GetMapping("/cities/{cityId}/districts")
    @Tag(name = "Konum")
    @Operation(summary = "Şehre göre ilçeler")
    public ResponseEntity<?> getDistricts(@PathVariable Long cityId) {
        return ResponseEntity.ok(ApiResponse.success(districtRepository.findByCityIdOrderByNameAsc(cityId)));
    }
}
