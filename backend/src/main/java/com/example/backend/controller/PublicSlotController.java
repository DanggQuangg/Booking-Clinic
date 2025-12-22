package com.example.backend.controller;

import com.example.backend.dto.SlotAvailabilityDto;
import com.example.backend.service.PublicSlotService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicSlotController {

    private final PublicSlotService slotService;

    public PublicSlotController(PublicSlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/doctors/{doctorId}/slots")
    public List<SlotAvailabilityDto> slots(@PathVariable Long doctorId,
                                           @RequestParam String date) {
        return slotService.listSlots(doctorId, LocalDate.parse(date)); // yyyy-mm-dd
    }
}
