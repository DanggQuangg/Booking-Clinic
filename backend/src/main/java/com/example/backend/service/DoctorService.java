package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository; // slot tái khám
    private final DoctorEmploymentRepository employmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordItemRepository medicalRecordItemRepository;
    private final DoctorWorkShiftRepository workShiftRepository;
    private final ClinicRoomRepository roomRepository;

    // 1) Dashboard: check FULL_TIME/PART_TIME
    public DoctorDashboardDto getDashboardInfo(Long doctorId) {
        DoctorDashboardDto dto = new DoctorDashboardDto();

        String type = "FULL_TIME";
        var emp = employmentRepository.findById(doctorId);
        if (emp.isPresent() && emp.get().getEmploymentType() != null) {
            type = emp.get().getEmploymentType().name();
        }

        dto.setEmploymentType(type);
        return dto;
    }

    // 2) Queue theo ngày
    public List<DoctorQueueItemDto> getQueueByDate(Long doctorId, LocalDate date) {
        List<Appointment> list = appointmentRepository.findDoctorQueue(doctorId, date);

        return list.stream().map(appt -> {
            DoctorQueueItemDto dto = new DoctorQueueItemDto();
            dto.setAppointmentId(appt.getId());
            dto.setStatus(appt.getStatus().name());
            dto.setReason(appt.getNote());

            if (appt.getSlot() != null) {
                String time = appt.getSlot().getStartTime().toString().substring(0, 5)
                        + " - " + appt.getSlot().getEndTime().toString().substring(0, 5);
                dto.setTimeSlot(time);
            }

            if (appt.getPatientProfile() != null) {
                dto.setPatientName(appt.getPatientProfile().getFullName());
                dto.setGender(appt.getPatientProfile().getGender() != null
                        ? appt.getPatientProfile().getGender().name() : "N/A");

                int birthYear = appt.getPatientProfile().getDob() != null
                        ? appt.getPatientProfile().getDob().getYear() : 2000;
                dto.setAge(LocalDate.now().getYear() - birthYear);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // 3) Kê đơn + kết thúc khám + (optional) tạo tái khám
    @Transactional
    public SaveMedicalRecordResponse saveMedicalRecord(Long doctorId, MedicalRecordRequest req) {
        Appointment appt = appointmentRepository.findById(req.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Cuộc hẹn không tồn tại"));

        // Appointment phải thuộc bác sĩ này
        if (appt.getDoctor() == null || appt.getDoctor().getId() == null || !appt.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Không có quyền thao tác cuộc hẹn này");
        }

        if (appt.getStatus() == AppointmentStatus.DONE) {
            throw new RuntimeException("Cuộc hẹn đã hoàn tất, không thể kê đơn lại");
        }

        // unique appointment_id ở medical_records
        if (medicalRecordRepository.existsByAppointmentId(appt.getId())) {
            throw new RuntimeException("Cuộc hẹn này đã có bệnh án");
        }

        // --- tạo record ---
        MedicalRecord record = new MedicalRecord();
        record.setAppointment(appt);

        User doc = new User();
        doc.setId(doctorId);
        record.setDoctor(doc);

        record.setPatientUser(appt.getPatientUser());
        record.setPatientProfileId(appt.getPatientProfileId());

        record.setDiagnosis(req.getDiagnosis());
        record.setConclusion(req.getConclusion());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // --- items ---
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            List<MedicalRecordItem> items = req.getItems().stream().map(i -> {
                MedicalRecordItem item = new MedicalRecordItem();
                item.setRecord(savedRecord);

                MedicalRecordItemType t = MedicalRecordItemType.valueOf(
                        i.getItemType().trim().toUpperCase()
                );
                item.setItemType(t);

                item.setItemKey(i.getItemKey());
                item.setItemValue(i.getItemValue());
                return item;
            }).toList();

            medicalRecordItemRepository.saveAll(items);
        }


        // DONE appointment
        appt.setStatus(AppointmentStatus.DONE);
        appointmentRepository.save(appt);

        // --- optional: tạo tái khám ---
        Long followUpId = null;
        if (Boolean.TRUE.equals(req.getCreateFollowUp())) {
            if (req.getFollowUpDate() == null) {
                throw new RuntimeException("Thiếu followUpDate để tạo lịch tái khám");
            }
            if (req.getFollowUpSlotId() == null) {
                throw new RuntimeException("Thiếu followUpSlotId để tạo lịch tái khám");
            }
            followUpId = createFollowUpAppointmentFrom(appt, req);
        }

        SaveMedicalRecordResponse resp = new SaveMedicalRecordResponse();
        resp.setRecordId(savedRecord.getId());
        resp.setFollowUpAppointmentId(followUpId);
        resp.setMessage("Lưu bệnh án thành công!");
        return resp;
    }

    /**
     * Tạo cuộc hẹn tái khám dựa trên cuộc hẹn cũ
     * ✅ đúng theo entity Appointment của mày: room/slot/appointmentDate/specialty...
     */
    private Long createFollowUpAppointmentFrom(Appointment oldAppt, MedicalRecordRequest req) {
        Appointment follow = new Appointment();

        // bắt buộc theo schema
        follow.setPatientUser(oldAppt.getPatientUser());
        follow.setPatientProfileId(oldAppt.getPatientProfileId());
        follow.setDoctor(oldAppt.getDoctor());
        follow.setSpecialty(oldAppt.getSpecialty());

        // ✅ room của Appointment là "room"
        follow.setRoom(oldAppt.getRoom());

        // date
        follow.setAppointmentDate(req.getFollowUpDate());

        // slot
        AppointmentSlot slot = appointmentSlotRepository.findById(req.getFollowUpSlotId())
                .orElseThrow(() -> new RuntimeException("Slot tái khám không tồn tại"));
        follow.setSlot(slot);

        // ✅ status BOOKED không có -> dùng AWAITING_PAYMENT (đúng default flow)
        follow.setStatus(AppointmentStatus.AWAITING_PAYMENT);

        // note
        follow.setNote((req.getFollowUpNote() != null && !req.getFollowUpNote().isBlank())
                ? req.getFollowUpNote()
                : "Tái khám");

        // amounts / payment (để tránh null)
        BigDecimal baseFee = oldAppt.getBaseFee() != null ? oldAppt.getBaseFee() : BigDecimal.ZERO;
        follow.setBaseFee(baseFee);
        follow.setInsuranceUsed(false);
        follow.setInsuranceDiscount(BigDecimal.ZERO);
        follow.setServicesAmount(BigDecimal.ZERO);
        follow.setTotalAmount(baseFee);
        follow.setPaymentStatus(AppointmentPaymentStatus.UNPAID);

        Appointment saved = appointmentRepository.save(follow);
        return saved.getId();
    }

    // 4) Đăng ký ca part-time (validate + chống trùng)
    @Transactional
    public void registerShifts(Long doctorId, List<ShiftRegisterRequest> requests) {

        // ✅ không dùng EmploymentType (vì project mày không có enum đó)
        // Check bằng name() để chắc compile
        var emp = employmentRepository.findById(doctorId);
        if (emp.isPresent() && emp.get().getEmploymentType() != null) {
            String empType = emp.get().getEmploymentType().name(); // "FULL_TIME" hoặc "PART_TIME"...
            if ("FULL_TIME".equals(empType)) {
                throw new RuntimeException("Bác sĩ FULL_TIME không cần đăng ký ca part-time");
            }
        }

        ClinicRoom defaultRoom = roomRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám hệ thống (ID=1)"));

        User doc = new User();
        doc.setId(doctorId);

        for (ShiftRegisterRequest req : requests) {
            if (req.getWorkDate() == null) throw new RuntimeException("Thiếu workDate");
            if (req.getWorkDate().isBefore(LocalDate.now())) throw new RuntimeException("Không thể đăng ký ca trong quá khứ");
            if (req.getShift() == null) throw new RuntimeException("Thiếu shift");

            ShiftType shiftType = ShiftType.valueOf(req.getShift().trim().toUpperCase());

            // chống trùng ca cùng ngày
            if (workShiftRepository.existsByDoctor_IdAndWorkDateAndShift(doctorId, req.getWorkDate(), shiftType)) {
                continue; // hoặc throw nếu mày muốn
            }

            DoctorWorkShift shift = new DoctorWorkShift();
            shift.setDoctor(doc);
            shift.setWorkDate(req.getWorkDate());
            shift.setShift(shiftType);
            shift.setRoom(defaultRoom);
            shift.setStatus(WorkShiftStatus.REGISTERED);

            // giờ phải đúng trigger DB
            if (shiftType == ShiftType.MORNING) {
                shift.setDoctorStartTime(LocalTime.of(7, 0));
                shift.setDoctorEndTime(LocalTime.of(11, 30));
            } else {
                shift.setDoctorStartTime(LocalTime.of(12, 30));
                shift.setDoctorEndTime(LocalTime.of(17, 0));
            }

            workShiftRepository.save(shift);
        }
    }
}
