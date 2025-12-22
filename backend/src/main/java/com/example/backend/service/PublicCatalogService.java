package com.example.backend.service;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.entity.SlotStatus;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.repository.DoctorCatalogRepository;
import com.example.backend.repository.SpecialtyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PublicCatalogService {

    private final SpecialtyRepository specialtyRepo;
    private final DoctorCatalogRepository doctorCatalogRepo;

    public PublicCatalogService(SpecialtyRepository specialtyRepo,
                                DoctorCatalogRepository doctorCatalogRepo) {
        this.specialtyRepo = specialtyRepo;
        this.doctorCatalogRepo = doctorCatalogRepo;
    }

    public List<SpecialtyDto> listSpecialties() {
        return specialtyRepo.findAll().stream()
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();
    }

    public List<DoctorPublicDto> listAvailableDoctors(Long specialtyId, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // Mon=1..Sun=7
        return doctorCatalogRepo.findAvailableDoctors(
                specialtyId,
                dayOfWeek,
                UserRole.DOCTOR,
                UserStatus.ACTIVE,
                SlotStatus.ACTIVE
        );
    }
}
