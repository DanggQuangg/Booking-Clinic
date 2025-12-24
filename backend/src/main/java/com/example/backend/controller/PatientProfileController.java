package com.example.backend.controller;

import com.example.backend.dto.CreatePatientProfileRequest;
import com.example.backend.dto.PatientProfileDto;
import com.example.backend.dto.PatientProfileStatsDto;
import com.example.backend.dto.UpdatePatientProfileRequest;
import com.example.backend.service.PatientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientProfileController {

    private final PatientProfileService service;

    public PatientProfileController(PatientProfileService service) {
        this.service = service;
    }

    private Long me() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ✅ cũ: list basic
    @GetMapping("/profiles")
    public List<PatientProfileDto> profiles() {
        return service.listProfiles(me());
    }

    // ✅ mới: list có thống kê cho ProfilePage
    @GetMapping("/profiles/stats")
    public List<PatientProfileStatsDto> profilesStats() {
        return service.listProfilesWithStats(me());
    }

    @PostMapping("/profiles")
    public ResponseEntity<?> create(@Valid @RequestBody CreatePatientProfileRequest req) {
        try {
            return ResponseEntity.ok(service.create(me(), req));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // ✅ update
    @PutMapping("/profiles/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody UpdatePatientProfileRequest req) {
        try {
            return ResponseEntity.ok(service.update(me(), id, req));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // ✅ set default
    @PatchMapping("/profiles/{id}/default")
    public ResponseEntity<?> setDefault(@PathVariable Long id) {
        try {
            service.setDefault(me(), id);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // ✅ delete (block if has appointment)
    @DeleteMapping("/profiles/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(me(), id);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
