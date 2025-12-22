package com.example.backend.service;

import com.example.backend.dto.BookAppointmentRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AppointmentBookingService {

    private final PatientProfileRepository patientProfileRepo;
    private final DoctorWeeklyTimeSlotRepository slotRepo;
    private final DoctorProfileRepository doctorProfileRepo;
    private final DoctorSpecialtyRepository doctorSpecialtyRepo;
    private final AppointmentRepository appointmentRepo;

    public AppointmentBookingService(
            PatientProfileRepository patientProfileRepo,
            DoctorWeeklyTimeSlotRepository slotRepo,
            DoctorProfileRepository doctorProfileRepo,
            DoctorSpecialtyRepository doctorSpecialtyRepo,
            AppointmentRepository appointmentRepo
    ) {
        this.patientProfileRepo = patientProfileRepo;
        this.slotRepo = slotRepo;
        this.doctorProfileRepo = doctorProfileRepo;
        this.doctorSpecialtyRepo = doctorSpecialtyRepo;
        this.appointmentRepo = appointmentRepo;
    }

    @Transactional
    public Appointment book(Long patientUserId, BookAppointmentRequest req) {

        // 1) Profile phải thuộc user đang login
        PatientProfile profile = patientProfileRepo.findByIdAndOwnerUser_Id(req.patientProfileId(), patientUserId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ không thuộc tài khoản."));

        // 2) Slot tồn tại + ACTIVE + thuộc doctor
        DoctorWeeklyTimeSlot slot = slotRepo.findById(req.slotId())
                .orElseThrow(() -> new RuntimeException("Slot không tồn tại."));

        if (slot.getStatus() != SlotStatus.ACTIVE) {
            throw new RuntimeException("Slot đang INACTIVE.");
        }
        if (!slot.getDoctor().getId().equals(req.doctorId())) {
            throw new RuntimeException("Slot không thuộc bác sĩ đã chọn.");
        }

        // 3) Check đúng thứ của ngày khám
        int dow = req.appointmentDate().getDayOfWeek().getValue(); // Mon=1..Sun=7
        if (!slot.getDayOfWeek().equals(dow)) {
            throw new RuntimeException("Ngày khám không khớp thứ của slot.");
        }

        // 4) Check doctor thuộc specialty (DB cũng có trigger, nhưng check ở code để báo lỗi đẹp)
        boolean ok = doctorSpecialtyRepo.existsByDoctor_IdAndSpecialty_Id(req.doctorId(), req.specialtyId());
        if (!ok) throw new RuntimeException("Bác sĩ không thuộc chuyên khoa đã chọn.");

        // 5) Check capacity
        long booked = appointmentRepo.countBooked(req.doctorId(), req.slotId(), req.appointmentDate());
        int remaining = slot.getCapacity() - (int) booked;
        if (remaining <= 0) throw new RuntimeException("Slot đã đầy.");

        // 6) Base fee từ doctor profile
        BigDecimal baseFee = doctorProfileRepo.findConsultationFeeByUserId(req.doctorId())
                .orElse(BigDecimal.ZERO);

        // 7) Insurance rules
        boolean insuranceUsed = Boolean.TRUE.equals(req.insuranceUsed());
        BigDecimal discount = req.insuranceDiscount() == null ? BigDecimal.ZERO : req.insuranceDiscount();
        if (!insuranceUsed) discount = BigDecimal.ZERO;

        BigDecimal maxDiscount = baseFee.multiply(new BigDecimal("0.80"));
        if (discount.compareTo(maxDiscount) > 0) {
            throw new RuntimeException("Giảm BHYT vượt quá 80% phí khám.");
        }

        // 8) Create appointment
        Appointment appt = Appointment.builder()
                .patientUser(profile.getOwnerUser())
                .patientProfileId(profile.getId())   // ✅ quan trọng: set field lưu DB
                // patientProfile là read-only, set hay không không quan trọng
                .specialty(Specialty.builder().id(req.specialtyId()).build())
                .doctor(User.builder().id(req.doctorId()).build())
                .slot(slot)
                .room(slot.getRoom())
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
