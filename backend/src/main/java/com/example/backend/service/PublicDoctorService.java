package com.example.backend.service;

import com.example.backend.dto.DoctorCardDto;
import com.example.backend.dto.DoctorDetailDto;
import com.example.backend.dto.DoctorShiftSlotDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicDoctorService {

    private final DoctorDirectoryRepository doctorDirectoryRepository;
    private final DoctorSpecialtyRepository doctorSpecialtyRepository;
    private final DoctorWorkShiftRepository doctorWorkShiftRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    public List<SpecialtyDto> listSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();
    }

    public List<DoctorCardDto> searchDoctors(Long specialtyId, String q) {
        String query = (q == null || q.trim().isEmpty()) ? null : q.trim();

        List<User> users = doctorDirectoryRepository.searchDoctors(
                query,
                specialtyId,
                UserRole.DOCTOR,
                UserStatus.ACTIVE
        );

        return users.stream().map(this::toCardDto).toList();
    }

    public List<DoctorCardDto> availableDoctors(Long specialtyId, LocalDate date) {
        if (specialtyId == null || date == null) return List.of();

        return doctorAvailabilityRepository
                .findAvailableDoctorsBySpecialtyAndDate(
                        specialtyId, date,
                        UserRole.DOCTOR, UserStatus.ACTIVE,
                        SlotStatus.ACTIVE, WorkShiftStatus.CANCELLED
                )
                .stream().map(this::toCardDto)
                .toList();
    }

    public DoctorDetailDto getDoctorDetail(Long doctorId) {
        User u = doctorDirectoryRepository.findDoctorByIdOrNull(
                doctorId, UserRole.DOCTOR, UserStatus.ACTIVE
        );
        if (u == null) return null;

        var dp = u.getDoctorProfile();

        List<SpecialtyDto> specs = doctorSpecialtyRepository.findAllByDoctor_Id(doctorId).stream()
                .map(DoctorSpecialty::getSpecialty)
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();

        // ====== lịch 14 ngày tới ======
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(13);

        var shifts = doctorWorkShiftRepository.findScheduleRange(
                doctorId, from, to, WorkShiftStatus.CANCELLED
        );

        var shiftIds = shifts.stream().map(DoctorWorkShift::getId).toList();
        var slots = shiftIds.isEmpty()
                ? List.<AppointmentSlot>of()
                : appointmentSlotRepository.findByShiftIds(shiftIds);

        var slotMap = slots.stream()
                .collect(Collectors.groupingBy(s -> s.getWorkShift().getId()));

        List<DoctorShiftSlotDto> schedule = shifts.stream().map(ws -> {
            var wsSlots = slotMap.getOrDefault(ws.getId(), List.of()).stream()
                    .map(sl -> new DoctorShiftSlotDto.SlotDto(
                            sl.getId(),
                            sl.getStartTime().toString(),
                            sl.getEndTime().toString(),
                            sl.getCapacity(),
                            sl.getStatus().name()
                    ))
                    .toList();

            return new DoctorShiftSlotDto(
                    ws.getId(),
                    ws.getWorkDate().toString(),
                    ws.getShift().name(),
                    ws.getDoctorStartTime().toString(),
                    ws.getDoctorEndTime().toString(),
                    ws.getRoom().getId(),
                    ws.getRoom().getRoomName(),
                    wsSlots
            );
        }).toList();

        // ⚠️ dòng này sẽ hết lỗi chỉ khi DoctorDetailDto khớp constructor/record (xem phần 2)
        return new DoctorDetailDto(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                dp.getGender() == null ? null : dp.getGender().name(),
                dp.getDob() == null ? null : dp.getDob().toString(),
                dp.getAvatarUrl(),
                dp.getDegree(),
                dp.getPositionTitle(),
                dp.getBio(),
                dp.getConsultationFee(),
                dp.getIsVerified(),
                specs,
                schedule
        );
    }

    private DoctorCardDto toCardDto(User u) {
        var dp = u.getDoctorProfile();

        List<SpecialtyDto> specs = doctorSpecialtyRepository.findAllByDoctor_Id(u.getId()).stream()
                .map(DoctorSpecialty::getSpecialty)
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();

        return new DoctorCardDto(
                u.getId(),
                u.getFullName(),
                dp.getAvatarUrl(),
                dp.getDegree(),
                dp.getPositionTitle(),
                dp.getConsultationFee(),
                dp.getIsVerified(),
                specs
        );
    }
}
