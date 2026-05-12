package com.pazaryeri.service.impl;

import com.pazaryeri.dto.request.ProducerProfileRequest;
import com.pazaryeri.dto.response.PageResponse;
import com.pazaryeri.dto.response.ProducerProfileResponse;
import com.pazaryeri.entity.City;
import com.pazaryeri.entity.District;
import com.pazaryeri.entity.ProducerProfile;
import com.pazaryeri.entity.User;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import com.pazaryeri.exception.BusinessException;
import com.pazaryeri.exception.ResourceNotFoundException;
import com.pazaryeri.repository.CityRepository;
import com.pazaryeri.repository.DistrictRepository;
import com.pazaryeri.repository.ProducerProfileRepository;
import com.pazaryeri.repository.UserRepository;
import com.pazaryeri.service.EmailService;
import com.pazaryeri.service.ProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProducerServiceImpl implements ProducerService {

    private final ProducerProfileRepository producerProfileRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final DistrictRepository districtRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public ProducerProfileResponse registerAsProducer(String userEmail, ProducerProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        if (producerProfileRepository.existsByUserId(user.getId())) {
            throw new BusinessException("Bu kullanıcının zaten bir üretici profili var");
        }

        City city = null;
        District district = null;
        if (request.getCityId() != null) {
            city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Şehir", request.getCityId()));
        }
        if (request.getDistrictId() != null) {
            district = districtRepository.findById(request.getDistrictId())
                    .orElseThrow(() -> new ResourceNotFoundException("İlçe", request.getDistrictId()));
        }

        ProducerProfile profile = ProducerProfile.builder()
                .user(user)
                .storeName(request.getStoreName())
                .storeDescription(request.getStoreDescription())
                .city(city)
                .district(district)
                .address(request.getAddress())
                .taxNumber(request.getTaxNumber())
                .iban(request.getIban())
                .logoUrl(request.getLogoUrl())
                .coverUrl(request.getCoverUrl())
                .approvalStatus(AccountStatus.PENDING_APPROVAL)
                .build();

        ProducerProfile saved = producerProfileRepository.save(profile);

        // Kullanıcı rolünü PRODUCER yap
        user.setRole(UserRole.PRODUCER);
        userRepository.save(user);

        log.info("Yeni üretici başvurusu: {} - {}", user.getEmail(), request.getStoreName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProducerProfileResponse updateProfile(String producerEmail, ProducerProfileRequest request) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        ProducerProfile profile = producerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Üretici profili bulunamadı"));

        City city = request.getCityId() != null
                ? cityRepository.findById(request.getCityId()).orElse(null) : null;
        District district = request.getDistrictId() != null
                ? districtRepository.findById(request.getDistrictId()).orElse(null) : null;

        profile.setStoreName(request.getStoreName());
        profile.setStoreDescription(request.getStoreDescription());
        profile.setCity(city);
        profile.setDistrict(district);
        profile.setAddress(request.getAddress());
        profile.setTaxNumber(request.getTaxNumber());
        profile.setIban(request.getIban());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setCoverUrl(request.getCoverUrl());

        return toResponse(producerProfileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public ProducerProfileResponse getMyProfile(String producerEmail) {
        User user = userRepository.findByEmail(producerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        ProducerProfile profile = producerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Üretici profili bulunamadı"));

        return toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public ProducerProfileResponse getProducerById(Long id) {
        return producerProfileRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Üretici profili", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProducerProfileResponse> searchProducers(String search, Long cityId,
                                                                  AccountStatus status, Pageable pageable) {
        // LOWER() bytea sorunu nedeniyle Java tarafında filtreleme yapıyoruz
        Page<ProducerProfile> all = producerProfileRepository.findAll(pageable);
        java.util.List<ProducerProfile> filtered = all.getContent().stream()
            .filter(p -> search == null || search.isBlank() ||
                (p.getStoreName() != null && p.getStoreName().toLowerCase().contains(search.toLowerCase())))
            .filter(p -> cityId == null ||
                (p.getCity() != null && p.getCity().getId().equals(cityId)))
            .filter(p -> status == null || status.equals(p.getApprovalStatus()))
            .toList();
        org.springframework.data.domain.Page<ProducerProfile> result =
            new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
        return PageResponse.of(result.map(this::toResponse));
    }

    @Override
    @Transactional
    public ProducerProfileResponse approveProducer(Long producerProfileId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin bulunamadı"));

        ProducerProfile profile = producerProfileRepository.findById(producerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Üretici profili", producerProfileId));

        if (profile.getApprovalStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new BusinessException("Bu profil zaten değerlendirilmiş");
        }

        profile.setApprovalStatus(AccountStatus.ACTIVE);
        profile.setApprovedBy(admin);
        profile.setApprovedAt(LocalDateTime.now());
        profile.setRejectionReason(null);

        log.info("Üretici onaylandı: {} - Admin: {}", profile.getStoreName(), adminEmail);
        ProducerProfile saved = producerProfileRepository.save(profile);
        emailService.sendProducerApprovalEmail(saved.getUser().getEmail(), saved.getStoreName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProducerProfileResponse rejectProducer(Long producerProfileId, String reason, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin bulunamadı"));

        ProducerProfile profile = producerProfileRepository.findById(producerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Üretici profili", producerProfileId));

        profile.setApprovalStatus(AccountStatus.INACTIVE);
        profile.setApprovedBy(admin);
        profile.setApprovedAt(LocalDateTime.now());
        profile.setRejectionReason(reason);

        log.info("Üretici reddedildi: {} - Sebep: {}", profile.getStoreName(), reason);
        ProducerProfile saved = producerProfileRepository.save(profile);
        emailService.sendProducerRejectionEmail(saved.getUser().getEmail(), saved.getStoreName(), reason);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void updateCommissionRate(Long producerProfileId, BigDecimal rate, String adminEmail) {
        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(new BigDecimal("100")) > 0) {
            throw new BusinessException("Komisyon oranı 0-100 arasında olmalıdır");
        }

        ProducerProfile profile = producerProfileRepository.findById(producerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Üretici profili", producerProfileId));

        profile.setCommissionRate(rate);
        producerProfileRepository.save(profile);

        log.info("Komisyon oranı güncellendi: {} -> {}% - Admin: {}", profile.getStoreName(), rate, adminEmail);
    }

    private ProducerProfileResponse toResponse(ProducerProfile profile) {
        return ProducerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .storeName(profile.getStoreName())
                .storeDescription(profile.getStoreDescription())
                .logoUrl(profile.getLogoUrl())
                .coverUrl(profile.getCoverUrl())
                .cityName(profile.getCity() != null ? profile.getCity().getName() : null)
                .districtName(profile.getDistrict() != null ? profile.getDistrict().getName() : null)
                .address(profile.getAddress())
                .commissionRate(profile.getCommissionRate())
                .approvalStatus(profile.getApprovalStatus())
                .rejectionReason(profile.getRejectionReason())
                .totalSales(profile.getTotalSales())
                .rating(profile.getRating())
                .ratingCount(profile.getRatingCount())
                .ownerName(profile.getUser().getFullName())
                .ownerEmail(profile.getUser().getEmail())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
