package com.example.backend.controller;

import com.example.backend.dto.DoctorCardDto;
import com.example.backend.dto.DoctorDetailDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.service.PublicDoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDoctorController {

    private final PublicDoctorService publicDoctorService;

    @GetMapping("/doctors")
    public List<DoctorCardDto> searchDoctors(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) String q
    ) {
        return publicDoctorService.searchDoctors(specialtyId, q);
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctor(@PathVariable("id") Long id) {
        DoctorDetailDto dto = publicDoctorService.getDoctorDetail(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }
}
