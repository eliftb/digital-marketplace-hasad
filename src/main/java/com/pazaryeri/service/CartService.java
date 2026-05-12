package com.pazaryeri.service;

import com.pazaryeri.dto.request.CartRequest;
import com.pazaryeri.dto.response.CartResponse;

public interface CartService {

    /** Kullanıcının sepetini getir (yoksa boş oluştur) */
    CartResponse getMyCart(String email);

    /** Sepete ürün ekle — ürün zaten varsa miktarı artır */
    CartResponse addItem(String email, CartRequest.AddItem request);

    /** Sepetteki bir kalemin miktarını güncelle */
    CartResponse updateItem(String email, Long productId, CartRequest.UpdateItem request);

    /** Sepetten ürün çıkar */
    CartResponse removeItem(String email, Long productId);

    /** Sepeti tamamen temizle */
    void clearCart(String email);

    /** Kaç kalem var? (Nav badge için) */
    int getItemCount(String email);
}
