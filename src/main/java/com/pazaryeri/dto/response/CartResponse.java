package com.pazaryeri.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {

    private Long id;
    private List<CartItemResponse> items;
    private int totalItemCount;
    private BigDecimal totalAmount;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private String imageUrl;
        private String producerStoreName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer stockQuantity;  // stok kontrolü için frontend'e gönder
        private boolean stockSufficient; // quantity <= stockQuantity mı?
    }
}
