package com.example.backend.service;

import com.example.backend.dto.PayInvoiceRequest;
import com.example.backend.dto.PayInvoiceResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final AppointmentRepository appointmentRepo;
    private final PaymentRepository paymentRepo;

    public PaymentService(AppointmentRepository appointmentRepo, PaymentRepository paymentRepo) {
        this.appointmentRepo = appointmentRepo;
        this.paymentRepo = paymentRepo;
    }

    @Transactional
    public PayInvoiceResponse pay(Long userId, PayInvoiceRequest req) {
        if (req == null || req.getAppointmentId() == null) {
            throw new IllegalArgumentException("Thiếu appointmentId");
        }

        Long appointmentId = req.getAppointmentId();

        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy appointmentId=" + appointmentId));

        // ✅ Chặn thanh toán lịch của người khác (bệnh nhân chỉ được thanh toán lịch của chính mình)
        // PatientProfile của bạn có field ownerUser (ManyToOne) + ownerUserId (shadow)
        if (appt.getPatientProfile() != null) {
            // Ưu tiên check ownerUserId (không cần load lazy User)
            Long ownerId = appt.getPatientProfile().getOwnerUserId();

            // Nếu ownerUserId null (hiếm) thì fallback sang ownerUser.getId()
            if (ownerId == null && appt.getPatientProfile().getOwnerUser() != null) {
                ownerId = appt.getPatientProfile().getOwnerUser().getId();
            }

            if (ownerId != null && !ownerId.equals(userId)) {
                throw new IllegalArgumentException("Bạn không có quyền thanh toán lịch hẹn này.");
            }
        }

        // Nếu đã PAID thì trả về luôn
        if (appt.getPaymentStatus() == AppointmentPaymentStatus.PAID) {
            return new PayInvoiceResponse(
                    "ALREADY_PAID",
                    appt.getId(),
                    appt.getPaymentStatus().name(),
                    appt.getPaidAt()
            );
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(req.getMethod());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ: " + req.getMethod());
        }

        LocalDateTime now = LocalDateTime.now();

        // 1) insert payment
        Payment payment = Payment.builder()
                .appointment(appt) // ✅ đúng theo entity Payment của bạn
                .amount(appt.getTotalAmount())
                .method(method)
                .status(PaymentTxnStatus.SUCCESS)
                .paidAt(now)
                .build();

        paymentRepo.save(payment);

        // 2) update appointment
        appt.setPaymentStatus(AppointmentPaymentStatus.PAID);
        appt.setPaidAt(now);

        if (appt.getStatus() == AppointmentStatus.AWAITING_PAYMENT) {
            appt.setStatus(AppointmentStatus.CONFIRMED);
        }

        appointmentRepo.save(appt);

        return new PayInvoiceResponse(
                "SUCCESS",
                appt.getId(),
                appt.getPaymentStatus().name(),
                appt.getPaidAt()
        );
    }
}
