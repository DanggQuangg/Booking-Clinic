package com.example.backend.service;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
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

        return doctorCatalogRepository.findAvailableDoctors(
                specialtyId,
                searchDate,
                UserRole.DOCTOR,
                UserStatus.ACTIVE,
                "ACTIVE" // Truyền String status
        );
    }
}