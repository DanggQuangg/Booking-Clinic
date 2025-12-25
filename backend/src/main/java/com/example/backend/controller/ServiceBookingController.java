package com.example.backend.controller;

import com.example.backend.dto.ServiceBookingCreateRequest;
import com.example.backend.dto.ServiceBookingCreateResponse;
import com.example.backend.service.ServiceBookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-bookings")
public class ServiceBookingController {

    private final ServiceBookingService bookingService;

    public ServiceBookingController(ServiceBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ServiceBookingCreateResponse create(@Valid @RequestBody ServiceBookingCreateRequest req,
                                               Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.create(userId, req);
    }
}