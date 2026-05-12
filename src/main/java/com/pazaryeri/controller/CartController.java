package com.pazaryeri.controller;

import com.pazaryeri.dto.request.CartRequest;
import com.pazaryeri.dto.response.ApiResponse;
import com.pazaryeri.dto.response.CartResponse;
import com.pazaryeri.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Sepet", description = "Alışveriş sepeti yönetimi")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Sepetimi getir")
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.getMyCart(userDetails.getUsername())));
    }

    @PostMapping("/items")
    @Operation(summary = "Sepete ürün ekle")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartRequest.AddItem request) {
        CartResponse response = cartService.addItem(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Ürün sepete eklendi", response));
    }

    @PatchMapping("/items/{productId}")
    @Operation(summary = "Sepetteki ürün miktarını güncelle")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartRequest.UpdateItem request) {
        CartResponse response = cartService.updateItem(userDetails.getUsername(), productId, request);
        return ResponseEntity.ok(ApiResponse.success("Miktar güncellendi", response));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Sepetten ürün çıkar")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.removeItem(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success("Ürün sepetten çıkarıldı", response));
    }

    @DeleteMapping
    @Operation(summary = "Sepeti temizle")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.successMessage("Sepet temizlendi"));
    }

    @GetMapping("/count")
    @Operation(summary = "Sepetteki ürün sayısı (nav badge için)")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getItemCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        int count = cartService.getItemCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }
}
