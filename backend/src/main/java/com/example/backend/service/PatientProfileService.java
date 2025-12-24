package com.example.backend.service;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.dto.PatientProfileDto;
import com.example.backend.dto.PatientProfileStatsDto;
import com.example.backend.dto.UpdatePatientProfileRequest;
import com.example.backend.entity.Gender;
import com.example.backend.entity.PatientProfile;
import com.example.backend.entity.User;
import com.example.backend.entity.AppointmentStatus;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientProfileRepository repo;
    private final AppointmentRepository appointmentRepo;

    private static final EnumSet<AppointmentStatus> NOT_VISITED = EnumSet.of(
            AppointmentStatus.AWAITING_PAYMENT,
            AppointmentStatus.CONFIRMED
    );

    @Transactional(readOnly = true)
    public List<PatientProfileDto> listProfiles(Long patientUserId) {
        return repo.findByOwnerUser_IdOrderByIsDefaultDescIdAsc(patientUserId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ✅ API cho ProfilePage: trả hồ sơ + số lần đặt lịch theo nhóm
    @Transactional(readOnly = true)
    public List<PatientProfileStatsDto> listProfilesWithStats(Long patientUserId) {
        LocalDate today = LocalDate.now();

        return repo.findByOwnerUser_IdOrderByIsDefaultDescIdAsc(patientUserId)
                .stream()
                .map(p -> {
                    long notVisited = appointmentRepo.countByPatientProfileIdAndStatusIn(p.getId(), NOT_VISITED);
                    long done = appointmentRepo.countByPatientProfileIdAndStatusIn(p.getId(), EnumSet.of(AppointmentStatus.DONE));
                    long upcoming = appointmentRepo.countUpcoming(p.getId(), NOT_VISITED, today);

                    return toStatsDto(p, notVisited, done, upcoming);
                })
                .toList();
    }

    @Transactional
    public PatientProfileDto create(Long patientUserId, CreatePatientProfileRequest req) {
        String fullName = trimToNull(req.fullName());
        if (fullName == null) throw new IllegalArgumentException("Vui lòng nhập họ tên.");

        boolean makeDefault = Boolean.TRUE.equals(req.isDefault());

        String phone = normalizePhone(trimToNull(req.phone()));
        validatePhoneOrThrow(phone);
        String citizenId = trimToNull(req.citizenId());
        String healthInsuranceCode = trimToNull(req.healthInsuranceCode());
        String address = trimToNull(req.address());
        String ethnicity = trimToNull(req.ethnicity());
        Gender gender = parseGenderOrNull(req.gender());

        // pre-check unique
        if (citizenId != null && repo.existsByCitizenId(citizenId)) {
            throw new IllegalArgumentException("CCCD đã tồn tại trong hệ thống.");
        }
        if (healthInsuranceCode != null && repo.existsByHealthInsuranceCode(healthInsuranceCode)) {
            throw new IllegalArgumentException("Mã BHYT đã tồn tại trong hệ thống.");
        }

        if (makeDefault) repo.clearDefaultForUser(patientUserId);

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
            return toDto(repo.save(p));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException(resolveDbMessage(ex));
        }
    }

    @Transactional
    public PatientProfileDto update(Long patientUserId, Long profileId, UpdatePatientProfileRequest req) {
        PatientProfile p = repo.findByIdAndOwnerUser_Id(profileId, patientUserId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ."));

        String fullName = trimToNull(req.fullName());
        if (fullName == null) throw new IllegalArgumentException("Vui lòng nhập họ tên.");

        boolean makeDefault = Boolean.TRUE.equals(req.isDefault());

        String phone = normalizePhone(trimToNull(req.phone()));
        validatePhoneOrThrow(phone);
        String citizenId = trimToNull(req.citizenId());
        String healthInsuranceCode = trimToNull(req.healthInsuranceCode());
        String address = trimToNull(req.address());
        String ethnicity = trimToNull(req.ethnicity());
        Gender gender = parseGenderOrNull(req.gender());

        // unique when update
        if (citizenId != null && repo.existsByCitizenIdAndIdNot(citizenId, p.getId())) {
            throw new IllegalArgumentException("CCCD đã tồn tại trong hệ thống.");
        }
        if (healthInsuranceCode != null && repo.existsByHealthInsuranceCodeAndIdNot(healthInsuranceCode, p.getId())) {
            throw new IllegalArgumentException("Mã BHYT đã tồn tại trong hệ thống.");
        }

        if (makeDefault) repo.clearDefaultForUser(patientUserId);

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
            return toDto(repo.save(p));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException(resolveDbMessage(ex));
        }
    }

    // ✅ chỉ set default riêng (tiện cho UI)
    @Transactional
    public void setDefault(Long patientUserId, Long profileId) {
        PatientProfile p = repo.findByIdAndOwnerUser_Id(profileId, patientUserId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ."));

        repo.clearDefaultForUser(patientUserId);
        p.setIsDefault(true);
        repo.save(p);
    }

    // ✅ xóa nếu chưa từng có appointment
    @Transactional
    public void delete(Long patientUserId, Long profileId) {
        PatientProfile p = repo.findByIdAndOwnerUser_Id(profileId, patientUserId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ."));

        if (appointmentRepo.existsByPatientProfileId(p.getId())) {
            throw new IllegalArgumentException("Không thể xóa: hồ sơ này đã từng đặt lịch khám.");
        }

        repo.delete(p);
    }

    // ===== mapping helpers =====

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


    private PatientProfileStatsDto toStatsDto(PatientProfile p, long notVisited, long done, long upcoming) {
        return new PatientProfileStatsDto(
                p.getId(),
                p.getFullName(),
                p.getPhone(),
                p.getDob() == null ? null : p.getDob().toString(),
                p.getGender() == null ? null : p.getGender().name(),
                p.getHealthInsuranceCode(),
                p.getCitizenId(),
                p.getAddress(),
                p.getEthnicity(),
                Boolean.TRUE.equals(p.getIsDefault()),
                notVisited,
                done,
                upcoming
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

    private static String resolveDbMessage(DataIntegrityViolationException ex) {
        String raw = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        if (raw == null) return "Dữ liệu không hợp lệ hoặc bị trùng.";

        String lower = raw.toLowerCase();
        if (lower.contains("uk_patient_profile_cccd") || lower.contains("citizen_id")) {
            return "CCCD đã tồn tại trong hệ thống.";
        }
        if (lower.contains("uk_patient_profile_bhyt") || lower.contains("health_insurance_code")) {
            return "Mã BHYT đã tồn tại trong hệ thống.";
        }
        if (lower.contains("uk_owner_default_profile") || lower.contains("default_marker")) {
            return "Mỗi tài khoản chỉ có thể có 1 hồ sơ mặc định.";
        }
        return "Dữ liệu không hợp lệ hoặc bị trùng.";
    }
    private static String normalizePhone(String phone) {
        if (phone == null) return null;
        String p = phone.trim()
                .replace(" ", "")
                .replace("-", "")
                .replace(".", "");
        return p.isEmpty() ? null : p;
    }

    private static void validatePhoneOrThrow(String phone) {
        if (phone == null) return;
        if (!phone.matches("^(\\+84|0)[0-9]{8,11}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ. Ví dụ: 0901234567 hoặc +84901234567.");
        }
    }

}
