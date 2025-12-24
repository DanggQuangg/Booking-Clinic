package com.example.backend.controller;

import com.example.backend.dto.AppointmentBucket;
import com.example.backend.dto.BookAppointmentRequest;
import com.example.backend.dto.CancelAppointmentResponse;
import com.example.backend.dto.PatientAppointmentDto;
import com.example.backend.dto.PrescriptionItemDto;
import com.example.backend.entity.Appointment;
import com.example.backend.service.AppointmentBookingService;
import com.example.backend.service.PatientAppointmentService;
import com.example.backend.service.PatientPrescriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient/appointments")
public class PatientAppointmentController {

    private final AppointmentBookingService bookingService;
    private final PatientAppointmentService patientAppointmentService;
    private final PatientPrescriptionService patientPrescriptionService; // NEW

    public PatientAppointmentController(
            AppointmentBookingService bookingService,
            PatientAppointmentService patientAppointmentService,
            PatientPrescriptionService patientPrescriptionService // NEW
    ) {
        this.bookingService = bookingService;
        this.patientAppointmentService = patientAppointmentService;
        this.patientPrescriptionService = patientPrescriptionService; // NEW
    }

    // =========================
    // 1) ĐẶT LỊCH
    // POST /api/patient/appointments
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
    // 2) DANH SÁCH LỊCH HẸN CỦA TÔI
    // GET /api/patient/appointments?bucket=&q=&page=&size=
    // =========================
    @GetMapping
    public ResponseEntity<Page<PatientAppointmentDto>> myAppointments(
            @RequestParam(required = false) AppointmentBucket bucket,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientAppointmentDto> result = patientAppointmentService.getMyAppointments(bucket, q, pageable);
        return ResponseEntity.ok(result);
    }

    // =========================
    // 3) XEM THUỐC / ĐƠN THUỐC THEO LỊCH HẸN
    // GET /api/patient/appointments/{appointmentId}/prescriptions
    // =========================
    @GetMapping("/{appointmentId}/prescriptions")
    public ResponseEntity<List<PrescriptionItemDto>> prescriptions(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(
                patientPrescriptionService.getPrescriptionsForAppointment(appointmentId)
        );
    }

    // =========================
    // 4) HỦY LỊCH
    // POST /api/patient/appointments/{id}/cancel
    // =========================
    @PostMapping("/{id}/cancel")
    public ResponseEntity<CancelAppointmentResponse> cancel(@PathVariable("id") Long appointmentId) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CancelAppointmentResponse res = patientAppointmentService.cancelAppointment(userId, appointmentId);
        return ResponseEntity.ok(res);
    }
}
