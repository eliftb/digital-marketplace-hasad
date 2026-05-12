package com.pazaryeri.service;

import com.pazaryeri.dto.request.ReviewRequest;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(String consumerEmail, ReviewRequest request);
    PageResponse<ReviewResponse> getProductReviews(Long productId, Pageable pageable);
    PageResponse<ReviewResponse> getMyReviews(String consumerEmail, Pageable pageable);
    PageResponse<ReviewResponse> getAllReviews(Pageable pageable);
    PageResponse<ReviewResponse> getPendingReviews(Pageable pageable);
    ReviewResponse approveReview(Long reviewId, String adminEmail);
    void deleteReview(Long reviewId, String adminEmail);
}
