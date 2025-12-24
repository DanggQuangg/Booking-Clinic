package com.example.backend.service;

import com.example.backend.dto.ServiceBookingHistoryDto;
import com.example.backend.entity.ServiceBooking;
import com.example.backend.entity.ServiceBookingStatus;
import com.example.backend.repository.ServiceBookingRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ServiceBookingHistoryService {

    private final ServiceBookingRepository bookingRepo;

    public ServiceBookingHistoryService(ServiceBookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    @Transactional(readOnly = true)
    public Page<ServiceBookingHistoryDto> myHistory(Long userId,
                                                    String q,
                                                    LocalDate fromDate,
                                                    LocalDate toDate,
                                                    String status,
                                                    String sort,
                                                    int page,
                                                    int size) {

        String kw = (q == null || q.trim().isEmpty()) ? null : q.trim();

        ServiceBookingStatus st = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                st = ServiceBookingStatus.valueOf(status.trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Status không hợp lệ: " + status);
            }
        }

        String so = (sort == null || sort.isBlank()) ? "date_desc" : sort.trim();

        Sort srt;
        if ("date_asc".equalsIgnoreCase(so)) {
            srt = Sort.by("serviceSlot.slotDate").ascending()
                    .and(Sort.by("serviceSlot.startTime").ascending())
                    .and(Sort.by("id").descending());
        } else {
            srt = Sort.by("serviceSlot.slotDate").descending()
                    .and(Sort.by("serviceSlot.startTime").descending())
                    .and(Sort.by("id").descending());
        }

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), srt);

        Page<ServiceBooking> p = bookingRepo.findMyHistory(userId, kw, fromDate, toDate, st, pageable);

        return p.map(b -> ServiceBookingHistoryDto.builder()
                .id(b.getId())
                .serviceId(b.getService() != null ? b.getService().getId() : null)
                .serviceName(b.getService() != null ? b.getService().getName() : null)
                .serviceSlotId(b.getServiceSlot() != null ? b.getServiceSlot().getId() : null)
                .slotDate(b.getServiceSlot() != null && b.getServiceSlot().getSlotDate() != null ? b.getServiceSlot().getSlotDate().toString() : null)
                .startTime(b.getServiceSlot() != null && b.getServiceSlot().getStartTime() != null ? b.getServiceSlot().getStartTime().toString() : null)
                .endTime(b.getServiceSlot() != null && b.getServiceSlot().getEndTime() != null ? b.getServiceSlot().getEndTime().toString() : null)
                .quantity(b.getQuantity())
                .unitPrice(b.getUnitPrice())
                .lineTotal(b.getLineTotal())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .note(b.getNote())
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                .build());
    }
}
