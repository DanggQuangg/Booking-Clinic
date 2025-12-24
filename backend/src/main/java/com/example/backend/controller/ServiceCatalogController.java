package com.example.backend.controller;

import com.example.backend.dto.ServiceCatalogDto;
import com.example.backend.dto.ServiceTimeSlotDto;
import com.example.backend.entity.ServiceStatus;
import com.example.backend.entity.ServiceTimeSlotStatus;
import com.example.backend.repository.ServiceCatalogRepository;
import com.example.backend.repository.ServiceTimeSlotRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceCatalogController {

    private final ServiceCatalogRepository serviceRepo;
    private final ServiceTimeSlotRepository slotRepo;

    public ServiceCatalogController(ServiceCatalogRepository serviceRepo, ServiceTimeSlotRepository slotRepo) {
        this.serviceRepo = serviceRepo;
        this.slotRepo = slotRepo;
    }

    @GetMapping
    public List<ServiceCatalogDto> listActive() {
        return serviceRepo.findByStatus(ServiceStatus.ACTIVE)
                .stream().map(ServiceCatalogDto::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ServiceCatalogDto detail(@PathVariable Long id) {
        var s = serviceRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dịch vụ."));
        return ServiceCatalogDto.from(s);
    }

    @GetMapping("/{id}/time-slots")
    public List<ServiceTimeSlotDto> slots(
            @PathVariable Long id,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return slotRepo.findByService_IdAndSlotDateAndStatusOrderByStartTimeAsc(
                        id, date, ServiceTimeSlotStatus.ACTIVE
                )
                .stream().map(ServiceTimeSlotDto::from)
                .toList();
    }
}