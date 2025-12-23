package com.example.backend.controller;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.service.PublicCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/doctors")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final PublicCatalogService publicCatalogService;

    @GetMapping
    public ResponseEntity<List<DoctorPublicDto>> getDoctors(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(publicCatalogService.getDoctors(specialtyId, date));
    }
}