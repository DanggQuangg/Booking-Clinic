package com.example.backend.service;

import com.example.backend.dto.SlotAvailabilityDto;
import com.example.backend.entity.SlotStatus;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.DoctorWeeklyTimeSlotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PublicSlotService {

    private final DoctorWeeklyTimeSlotRepository slotRepo;
    private final AppointmentRepository apptRepo;

    public PublicSlotService(DoctorWeeklyTimeSlotRepository slotRepo,
                             AppointmentRepository apptRepo) {
        this.slotRepo = slotRepo;
        this.apptRepo = apptRepo;
    }

    public List<SlotAvailabilityDto> listSlots(Long doctorId, LocalDate date) {
        int dow = date.getDayOfWeek().getValue(); // Mon=1..Sun=7

        var slots = slotRepo.findByDoctor_IdAndDayOfWeekAndStatusOrderByStartTimeAsc(
                doctorId, dow, SlotStatus.ACTIVE
        );

        return slots.stream().map(s -> {
            long booked = apptRepo.countBooked(doctorId, s.getId(), date);
            int remaining = Math.max(0, s.getCapacity() - (int) booked);
            return new SlotAvailabilityDto(
                    s.getId(),
                    s.getStartTime().toString(),
                    s.getEndTime().toString(),
                    s.getRoom().getId(),
                    s.getRoom().getRoomName(),
                    s.getCapacity(),
                    remaining
            );
        }).toList();
    }
}
