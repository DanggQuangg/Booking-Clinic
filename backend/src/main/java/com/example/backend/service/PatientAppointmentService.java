package com.example.backend.service;

import com.example.backend.dto.AppointmentBucket;
import com.example.backend.dto.PatientAppointmentDto;
import com.example.backend.repository.AppointmentRepository;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class PatientAppointmentService {

    private final AppointmentRepository appointmentRepository;

    public PatientAppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) throw new RuntimeException("Unauthenticated");
        // JwtAuthFilter set principal = userId (Long)
        return (Long) auth.getPrincipal();
    }

    public Page<PatientAppointmentDto> getMyAppointments(AppointmentBucket bucket, String q, Pageable pageable) {
        Long userId = currentUserId();

        if (bucket == null) bucket = AppointmentBucket.UPCOMING;

        return switch (bucket) {
            case DONE -> appointmentRepository.findDone(userId, q, pageable);
            case REGISTERED -> appointmentRepository.findRegistered(userId, q, pageable);
            case UPCOMING -> appointmentRepository.findUpcoming(userId, LocalDate.now(), q, pageable);
        };
    }
}
