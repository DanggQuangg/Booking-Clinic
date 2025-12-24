package com.example.backend.controller;

import com.example.backend.dto.InvoiceDto;
import com.example.backend.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
public class InvoiceController {

    private final InvoiceRepository repo;

    public InvoiceController(InvoiceRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/invoice")
    public InvoiceDto invoice(@RequestParam Long appointmentId) {
        return repo.getInvoice(appointmentId);
    }
}
