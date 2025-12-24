package com.example.backend.controller;

import com.example.backend.dto.PayInvoiceRequest;
import com.example.backend.dto.PayInvoiceResponse;
import com.example.backend.dto.PaymentConfirmRequest;
import com.example.backend.dto.PaymentConfirmResponse;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.AppointmentPaymentStatus;
import com.example.backend.entity.AppointmentStatus;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/patient")
public class PaymentController {

    private final PaymentService paymentService;
    private final AppointmentRepository appointmentRepository;

    public PaymentController(PaymentService paymentService, AppointmentRepository appointmentRepository) {
        this.paymentService = paymentService;
        this.appointmentRepository = appointmentRepository;
    }

    // =========================
    // 1) PAY (HEAD)
    // POST /api/patient/pay
    // =========================
    @PostMapping("/pay")
    public PayInvoiceResponse pay(@Valid @RequestBody PayInvoiceRequest req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal(); // JwtAuthFilter set principal = userId
        return paymentService.pay(userId, req);
    }

    // =========================
    // 2) CONFIRM APPOINTMENT PAYMENT (from origin/dlhd)
    // POST /api/patient/appointments/{id}/confirm
    // =========================
    @PostMapping("/appointments/{id}/confirm")
    public ResponseEntity<PaymentConfirmResponse> confirmAppointmentPayment(
            @PathVariable Long id,
            @RequestBody PaymentConfirmRequest req,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();

        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lịch hẹn không tồn tại"));

        // chỉ chủ lịch mới được thanh toán
        if (appt.getPatientUser() == null || appt.getPatientUser().getId() == null
                || !appt.getPatientUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền thanh toán lịch này");
        }

        // chỉ cho thanh toán khi đang chờ thanh toán
        if (appt.getStatus() != AppointmentStatus.AWAITING_PAYMENT
                || appt.getPaymentStatus() != AppointmentPaymentStatus.UNPAID) {
            throw new RuntimeException("Lịch này không ở trạng thái chờ thanh toán");
        }

        String method = normalizeMethod(req.getMethod());

        // xác nhận thanh toán => PAID + CONFIRMED
        appt.setPaymentStatus(AppointmentPaymentStatus.PAID);
        appt.setPaidAt(LocalDateTime.now());
        appt.setStatus(AppointmentStatus.CONFIRMED);

        // lưu method tạm vào note (nếu chưa có bảng Payment)
        String oldNote = appt.getNote() == null ? "" : appt.getNote();
        appt.setNote((oldNote + " | PAID_METHOD=" + method).trim());

        appointmentRepository.save(appt);

        PaymentConfirmResponse resp = new PaymentConfirmResponse();
        resp.setAppointmentId(appt.getId());
        resp.setStatus(appt.getStatus().name());
        resp.setPaymentStatus(appt.getPaymentStatus().name());
        resp.setMethod(method);
        resp.setMessage("Thanh toán thành công, lịch đã được xác nhận!");
        return ResponseEntity.ok(resp);
    }

    private String normalizeMethod(String m) {
        if (m == null) return "CASH";
        String x = m.trim().toUpperCase();

        // cho FE gửi tiếng Việt cũng được
        if (x.equals("TIEN_MAT")) return "CASH";
        if (x.equals("CHUYEN_KHOAN")) return "TRANSFER";

        // chuẩn
        if (x.equals("CASH")) return "CASH";
        if (x.equals("TRANSFER") || x.equals("BANK_TRANSFER")) return "TRANSFER";

        throw new RuntimeException("Phương thức thanh toán không hợp lệ");
    }
}
