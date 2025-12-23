package com.example.backend.service;

import com.example.backend.dto.SlotAvailabilityDto;
import com.example.backend.entity.*;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.AppointmentSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicSlotService {

    private final AppointmentSlotRepository appointmentSlotRepository;
    private final AppointmentRepository appointmentRepository;

    public List<SlotAvailabilityDto> getDoctorSlots(Long doctorId, LocalDate date) {

        List<AppointmentSlot> slots = appointmentSlotRepository.findActiveSlotsByDoctorAndDate(
                doctorId,
                date,
                SlotStatus.ACTIVE,
                WorkShiftStatus.CANCELLED
        );

        return slots.stream().map(slot -> {
            DoctorWorkShift ws = slot.getWorkShift();
            ClinicRoom room = ws.getRoom();

            // Option A
            long booked = appointmentRepository.countBooked(slot.getId(), date);

            int capacity = slot.getCapacity() == null ? 0 : slot.getCapacity();
            int remaining = Math.max(0, capacity - (int) booked);

            return new SlotAvailabilityDto(
                    slot.getId(),
                    slot.getStartTime().toString(),
                    slot.getEndTime().toString(),
                    room.getId(),
                    room.getRoomName(),
                    capacity,
                    remaining
            );
        }).toList();
    }
}
