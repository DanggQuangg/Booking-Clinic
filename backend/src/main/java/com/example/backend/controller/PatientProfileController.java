package com.example.backend.controller;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.entity.Gender;
import com.example.backend.entity.PatientProfile;
import com.example.backend.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;

import com.example.backend.dto.PatientProfileDto;
import com.example.backend.repository.PatientProfileRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientProfileController {

    private final PatientProfileRepository repo;

    public PatientProfileController(PatientProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/profiles")
    public List<PatientProfileDto> profiles() {
        Long patientUserId = 1L; // TODO: lấy từ JWT sau
        return repo.findByOwnerUser_IdOrderByIsDefaultDescIdAsc(patientUserId).stream()
                .map(p -> new PatientProfileDto(
                        p.getId(),
                        p.getFullName(),
                        p.getPhone(),
                        p.getDob() == null ? null : p.getDob().toString(),
                        p.getGender() == null ? null : p.getGender().name(),
                        p.getIsDefault()
                ))
                .toList();
    }
    @PostMapping("/profiles")
    public ResponseEntity<?> create(@Valid @RequestBody CreatePatientProfileRequest req) {
        Long patientUserId = 1L; // TODO: lấy từ JWT sau

        PatientProfile p = new PatientProfile();
        p.setOwnerUser(User.builder().id(patientUserId).build()); // set owner theo id

        p.setFullName(req.fullName());
        p.setPhone(req.phone());

        if (req.dob() != null && !req.dob().isBlank()) {
            p.setDob(LocalDate.parse(req.dob()));
        }
        if (req.gender() != null && !req.gender().isBlank()) {
            p.setGender(Gender.valueOf(req.gender()));
        }

        p.setIsDefault(Boolean.TRUE.equals(req.isDefault()));

        PatientProfile saved = repo.save(p);

        return ResponseEntity.ok(java.util.Map.of(
                "id", saved.getId(),
                "fullName", saved.getFullName()
        ));
    }

}
