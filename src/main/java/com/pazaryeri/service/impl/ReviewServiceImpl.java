package com.pazaryeri.service.impl;

import com.pazaryeri.dto.request.ReviewRequest;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.dto.response.ReviewResponse;
import com.pazaryeri.entity.OrderItem;
import com.pazaryeri.entity.Product;
import com.pazaryeri.entity.Review;
import com.pazaryeri.entity.User;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.exception.ResourceNotFoundException;
import com.pazaryeri.repository.*;
import com.pazaryeri.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(String consumerEmail, ReviewRequest request) {
        User consumer = userRepository.findByEmail(consumerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", request.getProductId()));

        // Aynı sipariş kalemi için tekrar değerlendirme yapılamaz
        if (request.getOrderItemId() != null &&
                reviewRepository.existsByOrderItemIdAndConsumerId(request.getOrderItemId(), consumer.getId())) {
            throw new BusinessException("Bu ürün için zaten bir değerlendirme yapmışsınız");
        }

        OrderItem orderItem = null;
        if (request.getOrderItemId() != null) {
            orderItem = orderItemRepository.findById(request.getOrderItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sipariş kalemi bulunamadı"));
            // Siparişin bu kullanıcıya ait olduğunu doğrula
            if (!orderItem.getOrder().getConsumer().getId().equals(consumer.getId())) {
                throw new BusinessException("Bu sipariş kalemi için değerlendirme yapma yetkiniz yok");
            }
        }

        Review review = Review.builder()
                .product(product)
                .consumer(consumer)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false) // Admin onayı bekliyor
                .build();

        Review saved = reviewRepository.save(review);

        // Ürün ortalama puanını güncelle
        updateProductRating(product);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        return PageResponse.of(
                reviewRepository.findByProductIdAndApprovedTrue(productId, pageable).map(this::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getMyReviews(String consumerEmail, Pageable pageable) {
        User consumer = userRepository.findByEmail(consumerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        return PageResponse.of(
                reviewRepository.findByConsumerId(consumer.getId(), pageable).map(this::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllReviews(Pageable pageable) {
        return PageResponse.of(reviewRepository.findAll(pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPendingReviews(Pageable pageable) {
        return PageResponse.of(
                reviewRepository.findByApprovedFalse(pageable).map(this::toResponse)
        );
    }

    @Override
    @Transactional
    public ReviewResponse approveReview(Long reviewId, String adminEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Değerlendirme", reviewId));
        review.setApproved(true);
        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String adminEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Değerlendirme", reviewId));
        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        Double avg = reviewRepository.calculateAverageRating(product.getId());
        long count = reviewRepository.countApprovedByProductId(product.getId());
        product.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : null);
        product.setRatingCount((int) count);
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .consumerId(review.getConsumer().getId())
                .consumerName(review.getConsumer().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .approved(review.getApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
