package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    private Long doctorId(Authentication auth) {
        // principal trong JwtAuthFilter đang set = userId (Long)
        return (Long) auth.getPrincipal();
    }

    @GetMapping("/info")
    public ResponseEntity<DoctorDashboardDto> getInfo(Authentication auth) {
        return ResponseEntity.ok(doctorService.getDashboardInfo(doctorId(auth)));
    }

    @GetMapping("/queue")
    public ResponseEntity<List<DoctorQueueItemDto>> getQueue(
            Authentication auth,
            @RequestParam(required = false) LocalDate date
    ) {
        LocalDate d = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(doctorService.getQueueByDate(doctorId(auth), d));
    }

    /**
     * Kê đơn + kết thúc khám + (tùy chọn) tạo lịch tái khám
     */
    @PostMapping("/medical-records")
    public ResponseEntity<SaveMedicalRecordResponse> saveRecord(
            Authentication auth,
            @RequestBody MedicalRecordRequest req
    ) {
        Long doctorId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(doctorService.saveMedicalRecord(doctorId, req));
    }

    /**
     * Đăng ký ca làm (part-time)
     */
    @PostMapping("/register-shift")
    public ResponseEntity<?> registerShift(
            Authentication auth,
            @RequestBody List<ShiftRegisterRequest> req
    ) {
        doctorService.registerShifts(doctorId(auth), req);
        return ResponseEntity.ok("Đăng ký lịch thành công!");
    }

}
