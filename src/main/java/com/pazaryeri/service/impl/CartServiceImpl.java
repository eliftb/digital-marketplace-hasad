package com.pazaryeri.service.impl;

import com.pazaryeri.dto.request.CartRequest;
import com.pazaryeri.dto.response.CartResponse;
import com.pazaryeri.entity.Cart;
import com.pazaryeri.entity.CartItem;
import com.pazaryeri.entity.Product;
import com.pazaryeri.entity.User;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.exception.ResourceNotFoundException;
import com.pazaryeri.repository.CartItemRepository;
import com.pazaryeri.repository.CartRepository;
import com.pazaryeri.repository.ProductRepository;
import com.pazaryeri.repository.UserRepository;
import com.pazaryeri.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getMyCart(String email) {
        Cart cart = cartRepository.findByUserEmailWithItems(email)
                .orElseGet(() -> createEmptyCart(email));
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(String email, CartRequest.AddItem request) {
        Cart cart = cartRepository.findByUserEmailWithItems(email)
                .orElseGet(() -> createEmptyCart(email));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException("Bu ürün şu anda satışta değil.");
        }

        // Zaten sepette var mı?
        cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .ifPresentOrElse(
                        existing -> {
                            int newQty = existing.getQuantity() + request.getQuantity();
                            if (newQty > product.getStockQuantity()) {
                                throw new BusinessException("Stok yetersiz. Mevcut stok: " + product.getStockQuantity());
                            }
                            existing.setQuantity(newQty);
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            if (request.getQuantity() > product.getStockQuantity()) {
                                throw new BusinessException("Stok yetersiz. Mevcut stok: " + product.getStockQuantity());
                            }
                            CartItem newItem = CartItem.builder()
                                    .cart(cart)
                                    .product(product)
                                    .quantity(request.getQuantity())
                                    .unitPrice(product.getPrice())
                                    .build();
                            cart.getItems().add(newItem);
                        }
                );

        Cart saved = cartRepository.save(cart);
        log.debug("Sepete eklendi: user={}, product={}, qty={}", email, product.getId(), request.getQuantity());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CartResponse updateItem(String email, Long productId, CartRequest.UpdateItem request) {
        Cart cart = cartRepository.findByUserEmailWithItems(email)
                .orElseThrow(() -> new ResourceNotFoundException("Sepet bulunamadı"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün sepette bulunamadı"));

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new BusinessException("Stok yetersiz. Mevcut stok: " + product.getStockQuantity());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        Cart refreshed = cartRepository.findByUserEmailWithItems(email).orElseThrow();
        return toResponse(refreshed);
    }

    @Override
    @Transactional
    public CartResponse removeItem(String email, Long productId) {
        Cart cart = cartRepository.findByUserEmailWithItems(email)
                .orElseThrow(() -> new ResourceNotFoundException("Sepet bulunamadı"));

        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);

        Cart refreshed = cartRepository.findByUserEmailWithItems(email).orElseThrow();
        return toResponse(refreshed);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        cartRepository.findByUserEmail(email).ifPresent(cart -> {
            cartItemRepository.deleteByCartId(cart.getId());
            log.debug("Sepet temizlendi: user={}", email);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public int getItemCount(String email) {
        return cartRepository.findByUserEmailWithItems(email)
                .map(Cart::getTotalItemCount)
                .orElse(0);
    }

    // ── Private helpers ──────────────────────────────────────────────

    private Cart createEmptyCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        Cart cart = Cart.builder().user(user).build();
        return cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    Product p = item.getProduct();
                    String imageUrl = (p.getImages() != null && !p.getImages().isEmpty())
                            ? p.getImages().get(0).getUrl() : null;
                    String storeName = (p.getProducerProfile() != null)
                            ? p.getProducerProfile().getStoreName() : null;

                    return CartResponse.CartItemResponse.builder()
                            .id(item.getId())
                            .productId(p.getId())
                            .productName(p.getName())
                            .productSlug(p.getSlug())
                            .imageUrl(imageUrl)
                            .producerStoreName(storeName)
                            .unitPrice(item.getUnitPrice())
                            .quantity(item.getQuantity())
                            .subtotal(item.getSubtotal())
                            .stockQuantity(p.getStockQuantity())
                            .stockSufficient(item.getQuantity() <= p.getStockQuantity())
                            .build();
                })
                .toList();

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItemCount(cart.getTotalItemCount())
                .totalAmount(cart.getTotalAmount())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
