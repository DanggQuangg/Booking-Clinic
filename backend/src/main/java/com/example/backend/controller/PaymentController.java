package com.example.backend.controller;

import com.example.backend.JwtUtil;
import com.example.backend.dto.PaymentConfirmRequest;
import com.example.backend.dto.PaymentConfirmResponse;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.AppointmentPaymentStatus;
import com.example.backend.entity.AppointmentStatus;
import com.example.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final AppointmentRepository appointmentRepository;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.getUserId(authHeader.substring(7));
        }
        throw new RuntimeException("Unauthorized");
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

    @PostMapping("/appointments/{id}/confirm")
    public ResponseEntity<PaymentConfirmResponse> confirmAppointmentPayment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody PaymentConfirmRequest req
    ) {
        Long userId = getUserId(token);

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

        // ✅ xác nhận thanh toán => CONFIRMED
        appt.setPaymentStatus(AppointmentPaymentStatus.PAID);
        appt.setPaidAt(LocalDateTime.now());
        appt.setStatus(AppointmentStatus.CONFIRMED);

        // nếu mày muốn lưu method mà không tạo bảng Payment (vì chưa chắc entity Payment của mày thế nào),
        // tao nhét tạm vào note để khỏi mất dữ liệu:
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
}
