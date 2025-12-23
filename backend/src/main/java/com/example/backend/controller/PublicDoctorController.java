package com.example.backend.controller;

import com.example.backend.dto.DoctorDetailDto;
import com.example.backend.service.PublicDoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDoctorController {

    private final PublicDoctorService publicDoctorService;

    // ❌ ĐÃ XÓA/COMMENT HÀM NÀY ĐỂ TRÁNH LỖI XUNG ĐỘT URL
    // Vì đường dẫn "/api/public/doctors" đã được PublicCatalogController xử lý rồi.
    /*
    @GetMapping("/doctors")
    public List<DoctorCardDto> searchDoctors(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) String q
    ) {
        return publicDoctorService.searchDoctors(specialtyId, q);
    }
    */

    // ✅ GIỮ LẠI HÀM NÀY (Xem chi tiết bác sĩ)
    // Đường dẫn: /api/public/doctors/{id}
    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctor(@PathVariable("id") Long id) {
        DoctorDetailDto dto = publicDoctorService.getDoctorDetail(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/doctors/available")
    public List<DoctorCardDto> availableDoctors(
            @RequestParam Long specialtyId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return publicDoctorService.availableDoctors(specialtyId, date);
    }
    @GetMapping("/specialties")
    public List<SpecialtyDto> listSpecialties() {
        return publicDoctorService.listSpecialties();
    }

}
