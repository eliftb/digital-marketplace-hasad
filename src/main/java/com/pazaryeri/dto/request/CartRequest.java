package com.pazaryeri.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class CartRequest {

    @Data
    public static class AddItem {
        @NotNull(message = "Ürün ID zorunludur")
        private Long productId;

        @NotNull(message = "Miktar zorunludur")
        @Min(value = 1, message = "Miktar en az 1 olmalıdır")
        private Integer quantity;
    }

    @Data
    public static class UpdateItem {
        @NotNull(message = "Miktar zorunludur")
        @Min(value = 1, message = "Miktar en az 1 olmalıdır")
        private Integer quantity;
    }
}
