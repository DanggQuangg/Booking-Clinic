package com.example.backend.service;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.entity.WorkShiftStatus;
import com.example.backend.repository.DoctorCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private final DoctorCatalogRepository doctorCatalogRepository;

    public List<DoctorPublicDto> getDoctors(Long specialtyId, LocalDate date) {
        // Nếu không chọn ngày, mặc định lấy ngày hiện tại
        LocalDate searchDate = (date != null) ? date : LocalDate.now();

    public List<SpecialtyDto> listSpecialties() {
        return specialtyRepo.findAll().stream()
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();
    }

    public List<DoctorPublicDto> listAvailableDoctors(Long specialtyId, LocalDate date) {
        if (specialtyId == null || date == null) return List.of();

        return doctorCatalogRepo.findAvailableDoctorsByDate(
                specialtyId,
                date,
                UserRole.DOCTOR,
                UserStatus.ACTIVE,
                SlotStatus.ACTIVE,
                WorkShiftStatus.CANCELLED
        );
    }
}