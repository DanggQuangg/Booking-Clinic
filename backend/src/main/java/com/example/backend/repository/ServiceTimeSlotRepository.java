package com.example.backend.repository;

import com.example.backend.entity.ServiceTimeSlot;
import com.example.backend.entity.ServiceTimeSlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ServiceTimeSlotRepository extends JpaRepository<ServiceTimeSlot, Long> {
    List<ServiceTimeSlot> findByService_IdAndSlotDateAndStatusOrderByStartTimeAsc(
            Long serviceId, LocalDate slotDate, ServiceTimeSlotStatus status
    );
}
