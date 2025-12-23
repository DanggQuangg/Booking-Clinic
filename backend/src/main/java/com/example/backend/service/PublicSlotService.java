package com.example.backend.service;

import com.example.backend.dto.SlotAvailabilityDto;
import com.example.backend.entity.ClinicRoom;
import com.example.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PublicSlotService {

    private final DoctorWeeklyTimeSlotRepository slotRepo;
    private final AppointmentRepository apptRepo;
    private final ClinicRoomRepository clinicRoomRepo; // Thêm repo

    public PublicSlotService(DoctorWeeklyTimeSlotRepository slotRepo, AppointmentRepository apptRepo, ClinicRoomRepository clinicRoomRepo) {
        this.slotRepo = slotRepo;
        this.apptRepo = apptRepo;
        this.clinicRoomRepo = clinicRoomRepo;
    }

    public List<SlotAvailabilityDto> listSlots(Long doctorId, LocalDate date) {
        // FIX: Lấy list slot bằng hàm mới
        var allSlots = slotRepo.findAllByDoctorWorkShift_DoctorIdOrderByDoctorWorkShift_WorkDateAscStartTimeAsc(doctorId);

        return allSlots.stream()
                .filter(s -> s.getDoctorWorkShift().getWorkDate().equals(date)) // Lọc theo ngày
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .map(s -> {
                    long booked = apptRepo.countBooked(doctorId, s.getId(), date);
                    int remaining = Math.max(0, s.getCapacity() - (int) booked);
                    
                    // Lấy tên phòng
                    String roomName = clinicRoomRepo.findById(s.getDoctorWorkShift().getRoomId())
                            .map(ClinicRoom::getRoomName).orElse("N/A");

                    return new SlotAvailabilityDto(s.getId(), s.getStartTime().toString(), s.getEndTime().toString(),
                            s.getDoctorWorkShift().getRoomId(), roomName, s.getCapacity(), remaining);
                }).toList();
    }
}