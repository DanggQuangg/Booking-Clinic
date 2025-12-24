package com.example.backend.controller;

import com.example.backend.dto.PayInvoiceRequest;
import com.example.backend.dto.PayInvoiceResponse;
import com.example.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/pay")
    public PayInvoiceResponse pay(@Valid @RequestBody PayInvoiceRequest req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal(); // JwtAuthFilter set principal = userId
        return paymentService.pay(userId, req);
    }
}
