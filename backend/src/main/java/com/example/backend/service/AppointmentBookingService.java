package com.example.backend.service;

import com.example.backend.dto.BookAppointmentRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AppointmentBookingService {

    private final PatientProfileRepository patientProfileRepo;
    private final AppointmentSlotRepository appointmentSlotRepo;
    private final DoctorProfileRepository doctorProfileRepo;
    private final DoctorSpecialtyRepository doctorSpecialtyRepo;
    private final AppointmentRepository appointmentRepo;

    public AppointmentBookingService(
            PatientProfileRepository patientProfileRepo,
            AppointmentSlotRepository appointmentSlotRepo,
            DoctorProfileRepository doctorProfileRepo,
            DoctorSpecialtyRepository doctorSpecialtyRepo,
            AppointmentRepository appointmentRepo
    ) {
        this.patientProfileRepo = patientProfileRepo;
        this.appointmentSlotRepo = appointmentSlotRepo;
        this.doctorProfileRepo = doctorProfileRepo;
        this.doctorSpecialtyRepo = doctorSpecialtyRepo;
        this.appointmentRepo = appointmentRepo;
    }

    @Transactional
    public Appointment book(Long patientUserId, BookAppointmentRequest req) {

        // 1) Profile phải thuộc user đang login
        PatientProfile profile = patientProfileRepo
                .findByIdAndOwnerUser_Id(req.patientProfileId(), patientUserId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ không thuộc tài khoản."));

        // 2) Slot tồn tại + ACTIVE
        AppointmentSlot slot = appointmentSlotRepo.findById(req.slotId())
                .orElseThrow(() -> new RuntimeException("Slot không tồn tại."));

        if (slot.getStatus() != SlotStatus.ACTIVE) {
            throw new RuntimeException("Slot đang INACTIVE.");
        }

        // 3) Lấy shift (chứa doctor + room + workDate + status)
        DoctorWorkShift ws = slot.getWorkShift();
        if (ws == null) throw new RuntimeException("Slot không hợp lệ (thiếu workShift).");

        if (ws.getStatus() == WorkShiftStatus.CANCELLED) {
            throw new RuntimeException("Ca làm việc đã bị huỷ.");
        }

        // 4) slot phải thuộc đúng doctor đã chọn
        if (ws.getDoctor() == null || ws.getDoctor().getId() == null) {
            throw new RuntimeException("Slot không hợp lệ (thiếu doctor).");
        }
        if (!ws.getDoctor().getId().equals(req.doctorId())) {
            throw new RuntimeException("Slot không thuộc bác sĩ đã chọn.");
        }

        // 5) Ngày khám phải khớp work_date của shift (SQL trigger cũng check)
        LocalDate workDate = ws.getWorkDate();
        if (workDate == null) throw new RuntimeException("Slot không hợp lệ (thiếu workDate).");
        if (!workDate.equals(req.appointmentDate())) {
            throw new RuntimeException("Ngày khám không khớp ngày làm việc của bác sĩ.");
        }

        // 6) Check doctor thuộc specialty (DB cũng có trigger, check ở code để báo lỗi đẹp)
        boolean ok = doctorSpecialtyRepo.existsByDoctor_IdAndSpecialty_Id(req.doctorId(), req.specialtyId());
        if (!ok) throw new RuntimeException("Bác sĩ không thuộc chuyên khoa đã chọn.");

        // 7) Check capacity (Option A: theo slotId + date)
        long booked = appointmentRepo.countBooked(req.slotId(), req.appointmentDate());
        int capacity = slot.getCapacity() == null ? 0 : slot.getCapacity();
        int remaining = capacity - (int) booked;
        if (remaining <= 0) throw new RuntimeException("Slot đã đầy.");

        // 8) Base fee từ doctor profile
        BigDecimal baseFee = doctorProfileRepo.findConsultationFeeByUserId(req.doctorId())
                .orElse(BigDecimal.ZERO);

        // 9) Insurance rules
        boolean insuranceUsed = Boolean.TRUE.equals(req.insuranceUsed());
        BigDecimal discount = req.insuranceDiscount() == null ? BigDecimal.ZERO : req.insuranceDiscount();
        if (!insuranceUsed) discount = BigDecimal.ZERO;

        BigDecimal maxDiscount = baseFee.multiply(new BigDecimal("0.80"));
        if (discount.compareTo(maxDiscount) > 0) {
            throw new RuntimeException("Giảm BHYT vượt quá 80% phí khám.");
        }

        // 10) Create appointment
        // room lấy từ workShift.room (DB trigger cũng set NEW.room_id = shift.room_id)
        Appointment appt = Appointment.builder()
                .patientUser(profile.getOwnerUser())
                .patientProfileId(profile.getId()) // bạn đang lưu field này
                .specialty(Specialty.builder().id(req.specialtyId()).build())
                .doctor(User.builder().id(req.doctorId()).build())
                .slot(slot)
                .room(ws.getRoom())
                .appointmentDate(req.appointmentDate())
                .status(AppointmentStatus.AWAITING_PAYMENT)
                .paymentStatus(AppointmentPaymentStatus.UNPAID)
                .baseFee(baseFee)
                .insuranceUsed(insuranceUsed)
                .insuranceDiscount(discount)
                .servicesAmount(BigDecimal.ZERO)
                .totalAmount(baseFee.subtract(discount))
                .note(req.note())
                .build();

        return appointmentRepo.save(appt);
    }
}
