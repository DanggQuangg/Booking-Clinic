package com.example.backend.service;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.entity.PatientProfile;
import com.example.backend.entity.User;
import com.example.backend.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepo;

    @Transactional
    public PatientProfile create(Long patientUserId, CreatePatientProfileRequest req) {

        PatientProfile p = new PatientProfile();
        p.setOwnerUser(User.builder().id(patientUserId).build()); // ✅ GẮN OWNER Ở ĐÂY

        p.setFullName(req.fullName().trim());
        p.setPhone(req.phone());
        p.setDob(req.dob());

        if (req.gender() != null) {
            p.setGender(com.example.backend.entity.Gender.valueOf(req.gender()));
        } else {
            p.setGender(null);
        }

        p.setIsDefault(Boolean.TRUE.equals(req.isDefault()));

        // (tuỳ chọn) nếu set default thì bỏ default của các profile khác của user đó
        if (Boolean.TRUE.equals(req.isDefault())) {
            patientProfileRepo.clearDefaultForUser(patientUserId);
        }

        return patientProfileRepo.save(p);
    }
}
