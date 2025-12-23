package com.example.backend.controller;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.dto.PatientProfileDto;
import com.example.backend.entity.Gender;
import com.example.backend.entity.PatientProfile;
import com.example.backend.entity.User;
import com.example.backend.repository.PatientProfileRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientProfileController {

    private final PatientProfileRepository repo;

    public PatientProfileController(PatientProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/profiles")
    public List<PatientProfileDto> profiles() {
        Long patientUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return repo.findByOwnerUser_IdOrderByIsDefaultDescIdAsc(patientUserId).stream()
                .map(p -> new PatientProfileDto(
                        p.getId(),
                        p.getFullName(),
                        p.getPhone(),
                        p.getDob() == null ? null : p.getDob().toString(),
                        p.getGender() == null ? null : p.getGender().name(),
                        Boolean.TRUE.equals(p.getIsDefault())
                ))
                .toList();
    }

    @PostMapping("/profiles")
    @Transactional
    public ResponseEntity<?> create(@Valid @RequestBody CreatePatientProfileRequest req) {
        Long patientUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String fullName = req.fullName() == null ? "" : req.fullName().trim();
        if (fullName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập họ tên."));
        }

        boolean makeDefault = Boolean.TRUE.equals(req.isDefault());
        if (makeDefault) {
            repo.clearDefaultForUser(patientUserId);
        }

        PatientProfile p = new PatientProfile();
        p.setOwnerUser(User.builder().id(patientUserId).build());
        p.setFullName(fullName);
        p.setPhone(req.phone() == null ? null : req.phone().trim());
        if (req.dob() != null) {
            p.setDob(req.dob());
        }


        if (req.gender() != null && !req.gender().isBlank()) {
            p.setGender(Gender.valueOf(req.gender().trim()));
        }

        p.setIsDefault(makeDefault);

        PatientProfile saved = repo.save(p);

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "fullName", saved.getFullName(),
                "isDefault", Boolean.TRUE.equals(saved.getIsDefault())
        ));
    }

}
