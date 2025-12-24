package com.example.backend.controller;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.dto.PatientProfileDto;
import com.example.backend.service.PatientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientProfileController {

    private final PatientProfileService service;

    public PatientProfileController(PatientProfileService service) {
        this.service = service;
    }

    @GetMapping("/profiles")
    public ResponseEntity<?> profiles() {
        try {
            Long patientUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return ResponseEntity.ok(service.listProfiles(patientUserId));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }


    @PostMapping("/profiles")
    public ResponseEntity<?> create(@Valid @RequestBody CreatePatientProfileRequest req) {
        Long patientUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            PatientProfileDto created = service.create(patientUserId, req);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

}
