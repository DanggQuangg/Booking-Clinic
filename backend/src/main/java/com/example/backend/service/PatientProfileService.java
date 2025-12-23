package com.example.backend.service;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.dto.PatientProfileDto;
import com.example.backend.entity.Gender;
import com.example.backend.entity.PatientProfile;
import com.example.backend.entity.User;
import com.example.backend.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientProfileRepository repo;

    @Transactional(readOnly = true)
    public List<PatientProfileDto> listProfiles(Long patientUserId) {
        return repo.findByOwnerUser_IdOrderByIsDefaultDescIdAsc(patientUserId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PatientProfileDto create(Long patientUserId, CreatePatientProfileRequest req) {

        String fullName = trimToNull(req.fullName());
        if (fullName == null) {
            throw new IllegalArgumentException("Vui lòng nhập họ tên.");
        }

        boolean makeDefault = Boolean.TRUE.equals(req.isDefault());

        // Chuẩn hoá dữ liệu
        String phone = trimToNull(req.phone());
        String citizenId = trimToNull(req.citizenId());
        String healthInsuranceCode = trimToNull(req.healthInsuranceCode());
        String address = trimToNull(req.address());
        String ethnicity = trimToNull(req.ethnicity());
        Gender gender = parseGenderOrNull(req.gender());

        // (Tùy chọn nhưng nên có) pre-check unique để trả message rõ
        if (citizenId != null && repo.existsByCitizenId(citizenId)) {
            throw new IllegalArgumentException("CCCD đã tồn tại trong hệ thống.");
        }
        if (healthInsuranceCode != null && repo.existsByHealthInsuranceCode(healthInsuranceCode)) {
            throw new IllegalArgumentException("Mã BHYT đã tồn tại trong hệ thống.");
        }

        if (makeDefault) {
            repo.clearDefaultForUser(patientUserId);
        }

        PatientProfile p = new PatientProfile();
        p.setOwnerUser(User.builder().id(patientUserId).build());
        p.setFullName(fullName);
        p.setPhone(phone);
        p.setDob(req.dob());
        p.setGender(gender);
        p.setCitizenId(citizenId);
        p.setHealthInsuranceCode(healthInsuranceCode);
        p.setAddress(address);
        p.setEthnicity(ethnicity);
        p.setIsDefault(makeDefault);

        try {
            PatientProfile saved = repo.save(p);
            return toDto(saved);
        } catch (DataIntegrityViolationException ex) {
            // Trường hợp race-condition hoặc DB bắt unique trước
            String msg = "Dữ liệu không hợp lệ hoặc bị trùng.";
            // Cố gắng đoán theo constraint name (MySQL thường có tên constraint trong message)
            String raw = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            if (raw != null) {
                String lower = raw.toLowerCase();
                if (lower.contains("uk_patient_profile_cccd") || lower.contains("citizen_id")) {
                    msg = "CCCD đã tồn tại trong hệ thống.";
                } else if (lower.contains("uk_patient_profile_bhyt") || lower.contains("health_insurance_code")) {
                    msg = "Mã BHYT đã tồn tại trong hệ thống.";
                } else if (lower.contains("uk_owner_default_profile") || lower.contains("default_marker")) {
                    msg = "Mỗi tài khoản chỉ có thể có 1 hồ sơ mặc định.";
                }
            }
            throw new IllegalArgumentException(msg);
        }
    }

    private PatientProfileDto toDto(PatientProfile p) {
        return new PatientProfileDto(
                p.getId(),
                p.getFullName(),
                p.getPhone(),
                p.getDob() == null ? null : p.getDob().toString(),
                p.getGender() == null ? null : p.getGender().name(),
                p.getHealthInsuranceCode(),
                p.getCitizenId(),
                p.getAddress(),
                p.getEthnicity(),
                Boolean.TRUE.equals(p.getIsDefault())
        );
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static Gender parseGenderOrNull(String gender) {
        String g = trimToNull(gender);
        if (g == null) return null;
        try {
            return Gender.valueOf(g);
        } catch (Exception e) {
            throw new IllegalArgumentException("Giới tính không hợp lệ. Chỉ nhận: MALE/FEMALE/OTHER.");
        }
    }
}
