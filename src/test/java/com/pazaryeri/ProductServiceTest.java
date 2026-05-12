package com.pazaryeri;

import com.pazaryeri.dto.request.ProductRequest;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.dto.response.ProductResponse;
import com.pazaryeri.entity.*;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.DeliveryType;
import com.pazaryeri.enums.UserRole;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.repository.*;
import com.pazaryeri.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProducerProfileRepository producerProfileRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private User producer;
    private ProducerProfile producerProfile;
    private Category category;

    @BeforeEach
    void setUp() {
        producer = User.builder()
                .id(1L).email("producer@test.com")
                .firstName("Ali").lastName("Üretici")
                .role(UserRole.PRODUCER).build();

        producerProfile = ProducerProfile.builder()
                .id(1L).user(producer)
                .storeName("Test Mağazası")
                .approvalStatus(AccountStatus.ACTIVE)
                .commissionRate(new BigDecimal("10.00"))
                .build();

        category = Category.builder()
                .id(1L).name("Tarım").slug("tarim").build();
    }

    @Test
    void createProduct_whenProducerActive_shouldSucceed() {
        ProductRequest request = new ProductRequest();
        request.setName("Organik Domates");
        request.setCategoryId(1L);
        request.setPrice(new BigDecimal("25.00"));
        request.setStockQuantity(100);
        request.setDeliveryType(DeliveryType.BOTH);
        request.setActive(true);
        request.setFeatured(false);
        request.setMinOrderQuantity(1);

        when(userRepository.findByEmail("producer@test.com")).thenReturn(Optional.of(producer));
        when(producerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(producerProfile));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p = Product.builder()
                    .id(1L).name(p.getName()).slug("organik-domates")
                    .price(p.getPrice()).stockQuantity(p.getStockQuantity())
                    .deliveryType(p.getDeliveryType()).active(p.getActive())
                    .featured(p.getFeatured()).soldCount(0).ratingCount(0)
                    .minOrderQuantity(1)
                    .producerProfile(producerProfile).category(category)
                    .images(List.of()).build();
            return p;
        });

        ProductResponse response = productService.createProduct("producer@test.com", request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Organik Domates");
        assertThat(response.getPrice()).isEqualByComparingTo("25.00");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_whenProducerPending_shouldThrow() {
        producerProfile.setApprovalStatus(AccountStatus.PENDING_APPROVAL);

        ProductRequest request = new ProductRequest();
        request.setName("Elma");
        request.setCategoryId(1L);
        request.setPrice(BigDecimal.TEN);
        request.setStockQuantity(50);
        request.setDeliveryType(DeliveryType.BOTH);
        request.setActive(true);
        request.setFeatured(false);
        request.setMinOrderQuantity(1);

        when(userRepository.findByEmail("producer@test.com")).thenReturn(Optional.of(producer));
        when(producerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(producerProfile));

        assertThatThrownBy(() -> productService.createProduct("producer@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("onaylı");
    }

    @Test
    void searchProducts_whenKeywordProvided_shouldUseKeywordSearch() {
        Product p = Product.builder()
                .id(1L).name("Domates").slug("domates")
                .price(new BigDecimal("15.00")).stockQuantity(50).active(true)
                .deliveryType(DeliveryType.BOTH).featured(false).soldCount(0)
                .ratingCount(0).minOrderQuantity(1)
                .producerProfile(producerProfile).category(category)
                .images(List.of()).build();

        when(productRepository.searchProductsWithKeyword(eq("%domates%"), eq(AccountStatus.ACTIVE),
                eq(DeliveryType.BOTH), isNull(), isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(p)));

        PageResponse<ProductResponse> result = productService.searchProducts(
                "domates", null, null, null, null, null,
                PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Domates");
        verify(productRepository).searchProductsWithKeyword(eq("%domates%"), eq(AccountStatus.ACTIVE),
                eq(DeliveryType.BOTH), isNull(), isNull(), isNull(), isNull(), isNull(), any());
        verify(productRepository, never()).searchProducts(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void searchProducts_whenKeywordNull_shouldUseFilterSearchWithoutKeyword() {
        when(productRepository.searchProducts(eq(AccountStatus.ACTIVE), eq(DeliveryType.BOTH),
                isNull(), isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponse<ProductResponse> result = productService.searchProducts(
                null, null, null, null, null, null,
                PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
        verify(productRepository).searchProducts(eq(AccountStatus.ACTIVE), eq(DeliveryType.BOTH),
                isNull(), isNull(), isNull(), isNull(), isNull(), any());
        verify(productRepository, never()).searchProductsWithKeyword(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void searchProducts_whenKeywordBlank_shouldUseFilterSearchWithoutKeyword() {
        when(productRepository.searchProducts(eq(AccountStatus.ACTIVE), eq(DeliveryType.BOTH),
                isNull(), isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponse<ProductResponse> result = productService.searchProducts(
                "   ", null, null, null, null, null,
                PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
        verify(productRepository).searchProducts(eq(AccountStatus.ACTIVE), eq(DeliveryType.BOTH),
                isNull(), isNull(), isNull(), isNull(), isNull(), any());
        verify(productRepository, never()).searchProductsWithKeyword(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}
