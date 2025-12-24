package com.example.backend.service;

import com.example.backend.dto.DoctorCardDto;
import com.example.backend.dto.DoctorDetailDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.entity.DoctorSpecialty;
import com.example.backend.entity.User;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.entity.SlotStatus;
import com.example.backend.entity.WorkShiftStatus;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicDoctorService {

    private final DoctorDirectoryRepository doctorDirectoryRepository;
    private final DoctorSpecialtyRepository doctorSpecialtyRepository;
    private final DoctorWorkShiftRepository doctorWorkShiftRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

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
                List.of()
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
}