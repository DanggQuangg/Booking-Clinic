package com.example.backend.controller;

import com.example.backend.dto.DoctorShiftItemDto;
import com.example.backend.dto.RegisterShiftRequest;
import com.example.backend.service.DoctorShiftService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor-internal/shifts")
public class DoctorInternalShiftController {

    private final DoctorShiftService doctorShiftService;

    public DoctorInternalShiftController(DoctorShiftService doctorShiftService) {
        this.doctorShiftService = doctorShiftService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody List<RegisterShiftRequest> reqs,
                                      Authentication auth) {
        // JwtAuthFilter set principal = userId (Long)
        Long doctorId = (Long) auth.getPrincipal();

        int saved = doctorShiftService.registerShifts(doctorId, reqs);
        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công",
                "saved", saved
        ));
    }

    // ✅ Lấy lịch đã đăng ký theo khoảng ngày
    // GET /api/doctor-internal/shifts/my?from=2025-12-27&to=2026-01-02
    @GetMapping("/my")
    public ResponseEntity<List<DoctorShiftItemDto>> myShifts(@RequestParam("from") LocalDate from,
                                                             @RequestParam("to") LocalDate to,
                                                             Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(doctorShiftService.getMyScheduleRange(doctorId, from, to));
    }

    // ✅ Hủy lịch
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable("id") Long id,
                                    Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        doctorShiftService.cancelShift(doctorId, id);
        return ResponseEntity.ok(Map.of("message", "Đã hủy lịch"));
    }
}
