package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.example.backend.JwtUtil;
import com.example.backend.service.MedicalRecordQueryService;
// inject MedicalRecordQueryService medicalRecordQueryService;


@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final MedicalRecordQueryService medicalRecordQueryService;
    private final JwtUtil jwtUtil;
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

    @GetMapping("/appointments/{appointmentId}/record")
    public ResponseEntity<?> getRecordForDoctor(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long appointmentId
    ) {
        if (authHeader == null || authHeader.isBlank()) {
            return ResponseEntity.status(401).body("Missing Authorization header");
        }

        // authHeader thường là: "Bearer xxx.yyy.zzz"
        String jwt = authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        Long doctorId = jwtUtil.getUserId(jwt);

        return ResponseEntity.ok(
                medicalRecordQueryService.getForDoctor(doctorId, appointmentId)
        );
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
