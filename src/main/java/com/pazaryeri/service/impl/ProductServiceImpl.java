package com.pazaryeri.service.impl;

import com.pazaryeri.dto.request.ProductRequest;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.dto.response.ProductResponse;
import com.pazaryeri.entity.*;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.DeliveryType;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.exception.ResourceNotFoundException;
import com.pazaryeri.repository.*;
import com.pazaryeri.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProducerProfileRepository producerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(String producerEmail, ProductRequest request) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        ProducerProfile producer = producerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Üretici profili bulunamadı"));

        if (producer.getApprovalStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Ürün eklemek için mağaza onaylı olmalıdır");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", request.getCategoryId()));

        String slug = generateUniqueSlug(request.getName());

        Product product = Product.builder()
                .producerProfile(producer)
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .unit(request.getUnit())
                .minOrderQuantity(request.getMinOrderQuantity())
                .deliveryType(request.getDeliveryType())
                .active(request.getActive())
                .featured(request.getFeatured())
                .build();

        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .url(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .isPrimary(i == 0)
                        .build();
                product.getImages().add(image);
            }
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, String producerEmail, ProductRequest request) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", productId));

        if (!product.getProducerProfile().getUser().getId().equals(user.getId())) {
            throw new BusinessException("Bu ürünü düzenleme yetkiniz yok");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", request.getCategoryId()));

        product.setName(request.getName());
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setUnit(request.getUnit());
        product.setMinOrderQuantity(request.getMinOrderQuantity());
        product.setDeliveryType(request.getDeliveryType());
        product.setActive(request.getActive());
        product.setFeatured(request.getFeatured());

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + slug));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(String search, Long categoryId, Long cityId,
                                                         DeliveryType deliveryType, BigDecimal minPrice,
                                                         BigDecimal maxPrice, Pageable pageable) {
        String normalizedSearch = search == null ? null : search.trim().toLowerCase(Locale.ROOT);
        Page<Product> page = normalizedSearch == null || normalizedSearch.isBlank()
                ? productRepository.searchProducts(AccountStatus.ACTIVE, DeliveryType.BOTH,
                        categoryId, cityId, deliveryType, minPrice, maxPrice, pageable)
                : productRepository.searchProductsWithKeyword("%" + normalizedSearch + "%",
                        AccountStatus.ACTIVE, DeliveryType.BOTH,
                        categoryId, cityId, deliveryType, minPrice, maxPrice, pageable);
        return PageResponse.of(page.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducerProducts(Long producerProfileId, Pageable pageable) {
        Page<Product> page = productRepository.findByProducerProfileIdAndActiveTrue(producerProfileId, pageable);
        return PageResponse.of(page.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getFeaturedProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByFeaturedTrueAndActiveTrue(pageable);
        return PageResponse.of(page.map(this::toResponse));
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, String producerEmail) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", productId));

        if (!product.getProducerProfile().getUser().getId().equals(user.getId())) {
            throw new BusinessException("Bu ürünü silme yetkiniz yok");
        }

        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void toggleProductStatus(Long productId, String producerEmail) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", productId));

        if (!product.getProducerProfile().getUser().getId().equals(user.getId())) {
            throw new BusinessException("Bu ürün üzerinde işlem yapma yetkiniz yok");
        }

        product.setActive(!product.getActive());
        productRepository.save(product);
    }

    private String generateUniqueSlug(String name) {
        String base = Normalizer.normalize(name.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();

        String slug = base;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getImages().stream()
                .sorted((a, b) -> a.getSortOrder() - b.getSortOrder())
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        ProducerProfile pp = product.getProducerProfile();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .unit(product.getUnit())
                .minOrderQuantity(product.getMinOrderQuantity())
                .deliveryType(product.getDeliveryType())
                .active(product.getActive())
                .featured(product.getFeatured())
                .soldCount(product.getSoldCount())
                .rating(product.getRating())
                .ratingCount(product.getRatingCount())
                .imageUrls(imageUrls)
                .category(ProductResponse.CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .build())
                .producer(ProductResponse.ProducerSummaryResponse.builder()
                        .id(pp.getId())
                        .storeName(pp.getStoreName())
                        .logoUrl(pp.getLogoUrl())
                        .cityName(pp.getCity() != null ? pp.getCity().getName() : null)
                        .rating(pp.getRating())
                        .build())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
