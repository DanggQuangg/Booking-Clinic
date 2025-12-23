package com.example.backend.service;

import com.example.backend.dto.DoctorCardDto;
import com.example.backend.dto.DoctorDetailDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.entity.DoctorSpecialty;
import com.example.backend.entity.DoctorWeeklyTimeSlot;
import com.example.backend.entity.User;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.repository.DoctorDirectoryRepository;
import com.example.backend.repository.DoctorSpecialtyRepository;
import com.example.backend.repository.DoctorWeeklyTimeSlotRepository;
import com.example.backend.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicDoctorService {

    private final DoctorDirectoryRepository doctorDirectoryRepository;
    private final DoctorSpecialtyRepository doctorSpecialtyRepository;
    private final DoctorWeeklyTimeSlotRepository slotRepository;
    private final SpecialtyRepository specialtyRepository;

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

        List<DoctorDetailDto.WeeklySlotDto> slots = slotRepository
                .findAllByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(doctorId)
                .stream()
                .map(this::toWeeklySlotDto)
                .toList();

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
                slots
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

    private DoctorDetailDto.WeeklySlotDto toWeeklySlotDto(DoctorWeeklyTimeSlot s) {
        return new DoctorDetailDto.WeeklySlotDto(
                s.getId(),
                s.getDayOfWeek(),
                s.getStartTime() == null ? null : s.getStartTime().toString(),
                s.getEndTime() == null ? null : s.getEndTime().toString(),
                s.getRoom() == null ? null : s.getRoom().getRoomName(),
                s.getCapacity(),
                s.getStatus() == null ? null : s.getStatus().name()
        );
    }
}
