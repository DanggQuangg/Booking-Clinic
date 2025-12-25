package com.example.backend.service;

import com.example.backend.dto.DoctorShiftItemDto;
import com.example.backend.dto.RegisterShiftRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.ClinicRoomRepository;
import com.example.backend.repository.DoctorWorkShiftRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DoctorShiftService {

    private final DoctorWorkShiftRepository workShiftRepo;
    private final ClinicRoomRepository roomRepo;
    private final AppointmentRepository appointmentRepository; // ✅ ADD

    public DoctorShiftService(DoctorWorkShiftRepository workShiftRepo,
                              ClinicRoomRepository roomRepo,
                              AppointmentRepository appointmentRepository) {
        this.workShiftRepo = workShiftRepo;
        this.roomRepo = roomRepo;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public int registerShifts(Long doctorId, List<RegisterShiftRequest> reqs) {
        if (reqs == null || reqs.isEmpty()) return 0;

        ClinicRoom room = roomRepo.findFirstByStatusOrderByIdAsc(RoomStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("Không có phòng ACTIVE để xếp lịch"));

        List<DoctorWorkShift> toSave = new ArrayList<>();

        for (RegisterShiftRequest r : reqs) {
            if (workShiftRepo.existsByDoctor_IdAndWorkDateAndShift(doctorId, r.getWorkDate(), r.getShift())) {
                continue;
            }

            LocalTime start;
            LocalTime end;
            if (r.getShift() == ShiftType.MORNING) {
                start = LocalTime.of(7, 0);
                end = LocalTime.of(11, 30);
            } else {
                start = LocalTime.of(12, 30);
                end = LocalTime.of(17, 0);
            }

            User doctorRef = new User();
            doctorRef.setId(doctorId);

            DoctorWorkShift ws = DoctorWorkShift.builder()
                    .doctor(doctorRef)
                    .workDate(r.getWorkDate())
                    .shift(r.getShift())
                    .doctorStartTime(start)
                    .doctorEndTime(end)
                    .room(room)
                    .status(WorkShiftStatus.APPROVED) // bạn đang cho APPROVED luôn
                    .build();

            toSave.add(ws);
        }

        workShiftRepo.saveAll(toSave);
        return toSave.size();
    }

    public List<DoctorShiftItemDto> getMyScheduleRange(Long doctorId, LocalDate from, LocalDate to) {
        if (from == null || to == null) throw new IllegalArgumentException("Thiếu from/to");
        if (to.isBefore(from)) throw new IllegalArgumentException("to phải >= from");

        List<DoctorWorkShift> list = workShiftRepo.findScheduleRange(
                doctorId, from, to, WorkShiftStatus.CANCELLED
        );

        return list.stream().map(ws -> {
            boolean hasAppt = appointmentRepository.existsBySlot_WorkShift_Id(ws.getId());

            return DoctorShiftItemDto.builder()
                    .id(ws.getId())
                    .workDate(ws.getWorkDate())
                    .shift(ws.getShift())
                    .status(ws.getStatus())
                    .doctorStartTime(ws.getDoctorStartTime())
                    .doctorEndTime(ws.getDoctorEndTime())
                    .roomId(ws.getRoom() != null ? ws.getRoom().getId() : null)
                    .roomName(ws.getRoom() != null ? ws.getRoom().getRoomName() : null)
                    .hasAppointment(hasAppt) // ✅ NEW
                    .build();
        }).toList();
    }


    @Transactional
    public void cancelShift(Long doctorId, Long shiftId) {
        DoctorWorkShift ws = workShiftRepo.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift không tồn tại"));

        // chỉ cho hủy shift của chính mình
        if (ws.getDoctor() == null || ws.getDoctor().getId() == null || !ws.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Không có quyền hủy lịch này");
        }

        if (ws.getStatus() == WorkShiftStatus.CANCELLED) {
            return; // idempotent
        }

        // ✅ CHẶN HỦY nếu đã có appointment đặt vào slots của shift này
        boolean hasAnyAppointment = appointmentRepository.existsBySlot_WorkShift_Id(shiftId);
        if (hasAnyAppointment) {
            throw new RuntimeException("Không thể hủy: đã có bệnh nhân đặt lịch trong ca này");
        }

        // ✅ Mark CANCELLED (không delete)
        ws.setStatus(WorkShiftStatus.CANCELLED);
        workShiftRepo.save(ws);
    }
}
