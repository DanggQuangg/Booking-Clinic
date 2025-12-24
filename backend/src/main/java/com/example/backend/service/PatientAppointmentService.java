package com.example.backend.service;

import com.example.backend.dto.AppointmentBucket;
import com.example.backend.dto.CancelAppointmentResponse;
import com.example.backend.dto.PatientAppointmentDto;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.AppointmentStatus;
import com.example.backend.repository.AppointmentRepository;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import jakarta.transaction.Transactional;


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

    // Hủy lịch
    @Transactional
    public CancelAppointmentResponse cancelAppointment(Long ownerUserId, Long appointmentId) {

        Appointment appt = appointmentRepository
                .findByIdAndOwnerUserId(appointmentId, ownerUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hoặc không thuộc tài khoản"));

        // Không cho hủy nếu đã khám / đã hủy / vắng mặt (tùy bạn nới luật)
        AppointmentStatus st = appt.getStatus();
        if (st == AppointmentStatus.DONE) {
            throw new RuntimeException("Lịch đã khám, không thể hủy");
        }
        if (st == AppointmentStatus.CANCELLED) {
            return new CancelAppointmentResponse(appt.getId(), "CANCELLED", "Lịch đã được hủy trước đó");
        }
        if (st == AppointmentStatus.NO_SHOW) {
            throw new RuntimeException("Lịch đã bị đánh dấu vắng mặt, không thể hủy");
        }

        // ✅ set status CANCELLED
        appt.setStatus(AppointmentStatus.CANCELLED);

        // (OPTIONAL) nếu bạn có AppointmentSlot/DoctorWorkShift cần giải phóng slot thì xử lý thêm ở đây
        // Ví dụ: appt.getSlot().setStatus(SlotStatus.AVAILABLE) ... tùy schema bạn

        appointmentRepository.save(appt);

        return new CancelAppointmentResponse(appt.getId(), "CANCELLED", "Hủy lịch thành công");
    }
}
