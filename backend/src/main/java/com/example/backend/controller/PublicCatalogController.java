package com.example.backend.controller;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.dto.SpecialtyDto;
import com.example.backend.service.PublicCatalogService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/catalog")
public class PublicCatalogController {

    private final PublicCatalogService catalog;

    public PublicCatalogController(PublicCatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/specialties")
    public List<SpecialtyDto> specialties() {
        return catalog.listSpecialties();
    }

    @GetMapping("/doctors/available")
    public List<DoctorPublicDto> availableDoctors(
            @RequestParam Long specialtyId,
            @RequestParam String date
    ) {
        LocalDate d = LocalDate.parse(date); // expects yyyy-mm-dd
        return catalog.listAvailableDoctors(specialtyId, d);
    }
}