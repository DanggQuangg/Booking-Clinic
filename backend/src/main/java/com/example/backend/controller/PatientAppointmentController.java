package com.example.backend.controller;

import com.example.backend.dto.AppointmentBucket;
import com.example.backend.dto.BookAppointmentRequest;
import com.example.backend.dto.PatientAppointmentDto;
import com.example.backend.entity.Appointment;
import com.example.backend.service.AppointmentBookingService;
import com.example.backend.service.PatientAppointmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patient/appointments")
public class PatientAppointmentController {

    private final AppointmentBookingService bookingService;
    private final PatientAppointmentService patientAppointmentService;

    public PatientAppointmentController(
            AppointmentBookingService bookingService,
            PatientAppointmentService patientAppointmentService
    ) {
        this.bookingService = bookingService;
        this.patientAppointmentService = patientAppointmentService;
    }

    // =========================
    // 1) ĐẶT LỊCH (bạn đã có)
    // =========================
    @PostMapping
    public ResponseEntity<?> book(@Valid @RequestBody BookAppointmentRequest req) {
        Long patientUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Appointment appt = bookingService.book(patientUserId, req);

        return ResponseEntity.ok(Map.of(
                "appointmentId", appt.getId(),
                "status", appt.getStatus().name(),
                "paymentStatus", appt.getPaymentStatus().name(),
                "totalAmount", appt.getTotalAmount()
        ));
    }

    // =========================
    // 2) XEM LỊCH KHÁM (thêm mới)
    // =========================
    @GetMapping
    public ResponseEntity<Page<PatientAppointmentDto>> myAppointments(
            @RequestParam(required = false) AppointmentBucket bucket, // UPCOMING | REGISTERED | DONE
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientAppointmentDto> result = patientAppointmentService.getMyAppointments(bucket, q, pageable);
        return ResponseEntity.ok(result);
    }
}
