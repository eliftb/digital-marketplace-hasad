package com.pazaryeri;

import com.pazaryeri.dto.request.OrderRequest;
import com.pazaryeri.dto.response.OrderResponse;
import com.pazaryeri.entity.*;
import com.pazaryeri.enums.*;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.repository.*;
import com.pazaryeri.service.EmailService;
import com.pazaryeri.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ProducerProfileRepository producerProfileRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private CommissionTransactionRepository commissionTransactionRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User consumer;
    private ProducerProfile producerProfile;
    private Product product;

    @BeforeEach
    void setUp() {
        consumer = User.builder()
                .id(1L).email("consumer@test.com")
                .firstName("Ayşe").lastName("Tüketici")
                .role(UserRole.CONSUMER).build();

        User producerUser = User.builder()
                .id(2L).email("producer@test.com")
                .firstName("Ali").lastName("Üretici")
                .role(UserRole.PRODUCER).build();

        producerProfile = ProducerProfile.builder()
                .id(1L).user(producerUser)
                .storeName("Test Mağazası")
                .approvalStatus(AccountStatus.ACTIVE)
                .commissionRate(new BigDecimal("10.00"))
                .totalSales(BigDecimal.ZERO)
                .build();

        product = Product.builder()
                .id(1L).name("Organik Elma")
                .price(new BigDecimal("30.00"))
                .stockQuantity(100)
                .minOrderQuantity(1)
                .active(true)
                .soldCount(0)
                .deliveryType(DeliveryType.BOTH)
                .producerProfile(producerProfile)
                .images(new ArrayList<>())
                .build();
    }

    @Test
    void createOrder_pickup_shouldSucceed() {
        OrderRequest request = new OrderRequest();
        request.setDeliveryType(DeliveryType.PICKUP);
        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        when(userRepository.findByEmail("consumer@test.com")).thenReturn(Optional.of(consumer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenReturn(product);
        when(commissionTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderResponse response = orderService.createOrder("consumer@test.com", request);

        assertThat(response).isNotNull();
        assertThat(response.getOrderNumber()).startsWith("ORD-");
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(emailService).sendOrderConfirmationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void createOrder_shipping_withoutAddress_shouldThrow() {
        OrderRequest request = new OrderRequest();
        request.setDeliveryType(DeliveryType.SHIPPING);
        request.setShippingAddressId(null); // Adres yok!
        request.setItems(List.of());

        when(userRepository.findByEmail("consumer@test.com")).thenReturn(Optional.of(consumer));

        assertThatThrownBy(() -> orderService.createOrder("consumer@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("adres");
    }

    @Test
    void createOrder_insufficientStock_shouldThrow() {
        product.setStockQuantity(1); // Sadece 1 adet var

        OrderRequest request = new OrderRequest();
        request.setDeliveryType(DeliveryType.PICKUP);
        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(5); // 5 istiyor
        request.setItems(List.of(item));

        when(userRepository.findByEmail("consumer@test.com")).thenReturn(Optional.of(consumer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.createOrder("consumer@test.com", request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Yetersiz stok");
    }

    @Test
    void updateOrderStatus_validTransition_shouldSucceed() {
        Order order = Order.builder()
                .id(1L).consumer(consumer)
                .orderNumber("ORD-TEST-001")
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.TEN)
                .commissionTotal(BigDecimal.ONE)
                .shippingFee(BigDecimal.ZERO)
                .totalAmount(BigDecimal.TEN)
                .deliveryType(DeliveryType.PICKUP)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        doNothing().when(emailService).sendOrderStatusUpdateEmail(any(), any(), any(), any());

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED, "admin@test.com");

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    @Test
    void updateOrderStatus_invalidTransition_shouldThrow() {
        Order order = Order.builder()
                .id(1L).consumer(consumer)
                .orderNumber("ORD-TEST-001")
                .status(OrderStatus.DELIVERED) // Teslim edildi
                .items(new ArrayList<>())
                .subtotal(BigDecimal.TEN)
                .commissionTotal(BigDecimal.ONE)
                .shippingFee(BigDecimal.ZERO)
                .totalAmount(BigDecimal.TEN)
                .deliveryType(DeliveryType.PICKUP)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // DELIVERED -> PENDING geçişi geçersiz
        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, OrderStatus.PENDING, "admin@test.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Geçersiz durum geçişi");
    }
}
