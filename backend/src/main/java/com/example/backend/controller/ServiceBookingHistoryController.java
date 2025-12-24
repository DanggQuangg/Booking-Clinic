package com.example.backend.controller;

import com.example.backend.dto.ServiceBookingHistoryDto;
import com.example.backend.service.ServiceBookingHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/service-bookings")
public class ServiceBookingHistoryController {

    private final ServiceBookingHistoryService service;

    public ServiceBookingHistoryController(ServiceBookingHistoryService service) {
        this.service = service;
    }

    @GetMapping("/my")
    public Map<String, Object> myHistory(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "date_desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Page<ServiceBookingHistoryDto> p = service.myHistory(userId, q, from, to, status, sort, page, size);

        return Map.of(
                "items", p.getContent(),
                "page", p.getNumber(),
                "size", p.getSize(),
                "totalItems", p.getTotalElements(),
                "totalPages", p.getTotalPages()
        );
    }
}
