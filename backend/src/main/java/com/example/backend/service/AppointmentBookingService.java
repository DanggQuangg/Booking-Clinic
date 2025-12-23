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
    private final ClinicRoomRepository clinicRoomRepo; // Thêm repo này

    public AppointmentBookingService(
            PatientProfileRepository patientProfileRepo,
            DoctorWeeklyTimeSlotRepository slotRepo,
            DoctorProfileRepository doctorProfileRepo,
            DoctorSpecialtyRepository doctorSpecialtyRepo,
            AppointmentRepository appointmentRepo,
            ClinicRoomRepository clinicRoomRepo
    ) {
        this.patientProfileRepo = patientProfileRepo;
        this.slotRepo = slotRepo;
        this.doctorProfileRepo = doctorProfileRepo;
        this.doctorSpecialtyRepo = doctorSpecialtyRepo;
        this.appointmentRepo = appointmentRepo;
        this.clinicRoomRepo = clinicRoomRepo;
    }

    @Transactional
    public Appointment book(Long patientUserId, BookAppointmentRequest req) {
        // 1. Check Profile
        PatientProfile profile = patientProfileRepo.findByIdAndOwnerUser_Id(req.patientProfileId(), patientUserId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ không thuộc tài khoản."));

        // 2. Check Slot
        DoctorWeeklyTimeSlot slot = slotRepo.findById(req.slotId())
                .orElseThrow(() -> new RuntimeException("Slot không tồn tại."));

        if (!"ACTIVE".equals(slot.getStatus())) {
            throw new RuntimeException("Slot đang INACTIVE.");
        }

        // 3. Check Doctor (Lấy ID từ WorkShift)
        Long slotDoctorId = slot.getDoctorWorkShift().getDoctorId();
        if (!slotDoctorId.equals(req.doctorId())) {
            throw new RuntimeException("Slot không thuộc bác sĩ đã chọn.");
        }

        // 4. Check Ngày (Lấy Date từ WorkShift)
        if (!slot.getDoctorWorkShift().getWorkDate().equals(req.appointmentDate())) {
            throw new RuntimeException("Ngày khám không khớp với ngày của ca làm việc.");
        }

        // 5. Check chuyên khoa
        boolean ok = doctorSpecialtyRepo.existsByDoctor_IdAndSpecialty_Id(req.doctorId(), req.specialtyId());
        if (!ok) throw new RuntimeException("Bác sĩ không thuộc chuyên khoa đã chọn.");

        // 6. Check slot đầy
        long booked = appointmentRepo.countBooked(req.doctorId(), req.slotId(), req.appointmentDate());
        if (slot.getCapacity() - (int) booked <= 0) {
            throw new RuntimeException("Slot đã đầy.");
        }

        // 7. Lấy giá khám
        BigDecimal baseFee = doctorProfileRepo.findConsultationFeeByUserId(req.doctorId()).orElse(BigDecimal.ZERO);

        // 8. Tính BHYT
        boolean insuranceUsed = Boolean.TRUE.equals(req.insuranceUsed());
        BigDecimal discount = (insuranceUsed && req.insuranceDiscount() != null) ? req.insuranceDiscount() : BigDecimal.ZERO;
        if (discount.compareTo(baseFee.multiply(new BigDecimal("0.8"))) > 0) {
            throw new RuntimeException("Giảm BHYT vượt quá 80% phí khám.");
        }

        // 9. Lấy Phòng khám từ DB (thay vì slot.getRoom())
        ClinicRoom room = clinicRoomRepo.findById(slot.getDoctorWorkShift().getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng khám không tồn tại."));

        // 10. Tạo Appointment
        Appointment appt = Appointment.builder()
                .patientUser(profile.getOwnerUser())
                .patientProfileId(profile.getId())
                .specialty(new Specialty(req.specialtyId(), null, null, null))
                .doctor(User.builder().id(req.doctorId()).build())
                .slot(slot)
                .room(room) // Gán phòng vừa tìm được
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