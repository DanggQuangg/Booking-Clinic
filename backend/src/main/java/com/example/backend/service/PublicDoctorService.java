package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
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
    private final ClinicRoomRepository clinicRoomRepository; // Thêm repo

    public List<SpecialtyDto> listSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(s -> new SpecialtyDto(s.getId(), s.getName(), s.getDescription(), s.getImageUrl()))
                .toList();
    }

    public List<DoctorCardDto> searchDoctors(Long specialtyId, String q) {
        String query = (q == null || q.trim().isEmpty()) ? null : q.trim();
        return doctorDirectoryRepository.searchDoctors(query, specialtyId, UserRole.DOCTOR, UserStatus.ACTIVE)
                .stream().map(this::toCardDto).toList();
    }

    public DoctorDetailDto getDoctorDetail(Long doctorId) {
        User u = doctorDirectoryRepository.findDoctorByIdOrNull(doctorId, UserRole.DOCTOR, UserStatus.ACTIVE);
        if (u == null) return null;

        var dp = u.getDoctorProfile();
        List<SpecialtyDto> specs = doctorSpecialtyRepository.findAllByDoctor_Id(doctorId).stream()
                .map(ds -> new SpecialtyDto(ds.getSpecialty().getId(), ds.getSpecialty().getName(), ds.getSpecialty().getDescription(), ds.getSpecialty().getImageUrl()))
                .toList();

        // FIX: Gọi hàm repo mới
        List<DoctorDetailDto.WeeklySlotDto> slots = slotRepository
                .findAllByDoctorWorkShift_DoctorIdOrderByDoctorWorkShift_WorkDateAscStartTimeAsc(doctorId)
                .stream().map(this::toWeeklySlotDto).toList();

        return new DoctorDetailDto(u.getId(), u.getFullName(), u.getEmail(),
                dp.getGender() == null ? null : dp.getGender().name(),
                dp.getDob() == null ? null : dp.getDob().toString(),
                dp.getAvatarUrl(), dp.getDegree(), dp.getPositionTitle(), dp.getBio(),
                dp.getConsultationFee(), dp.getIsVerified(), specs, slots);
    }

    private DoctorCardDto toCardDto(User u) {
        var dp = u.getDoctorProfile();
        List<SpecialtyDto> specs = doctorSpecialtyRepository.findAllByDoctor_Id(u.getId()).stream()
                .map(ds -> new SpecialtyDto(ds.getSpecialty().getId(), ds.getSpecialty().getName(), null, null))
                .toList();
        return new DoctorCardDto(u.getId(), u.getFullName(), dp.getAvatarUrl(), dp.getDegree(), dp.getPositionTitle(), dp.getConsultationFee(), dp.getIsVerified(), specs);
    }

    private DoctorDetailDto.WeeklySlotDto toWeeklySlotDto(DoctorWeeklyTimeSlot s) {
        // FIX: Lấy tên phòng từ DB thông qua ID trong WorkShift
        String roomName = "N/A";
        if (s.getDoctorWorkShift().getRoomId() != null) {
            roomName = clinicRoomRepository.findById(s.getDoctorWorkShift().getRoomId())
                    .map(ClinicRoom::getRoomName).orElse("Unknown");
        }
        // FIX: Tính thứ từ ngày làm việc
        int dayOfWeek = s.getDoctorWorkShift().getWorkDate().getDayOfWeek().getValue();

        return new DoctorDetailDto.WeeklySlotDto(
                s.getId(), dayOfWeek,
                s.getStartTime().toString(), s.getEndTime().toString(),
                roomName, s.getCapacity(), s.getStatus());
    }
}