package com.example.backend.controller;

import com.example.backend.dto.BookAppointmentRequest;
import com.example.backend.entity.Appointment;
import com.example.backend.service.AppointmentBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/patient/appointments")
public class PatientAppointmentController {

    private final AppointmentBookingService bookingService;

    public PatientAppointmentController(AppointmentBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> book(@Valid @RequestBody BookAppointmentRequest req) {

        Long patientUserId = 101L; // hoặc id PATIENT thật của bạn

        Appointment appt = bookingService.book(patientUserId, req);

        return ResponseEntity.ok(Map.of(
                "appointmentId", appt.getId(),
                "status", appt.getStatus().name(),
                "paymentStatus", appt.getPaymentStatus().name(),
                "totalAmount", appt.getTotalAmount()
        ));
    }
}
