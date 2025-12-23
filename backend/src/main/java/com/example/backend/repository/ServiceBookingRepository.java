package com.example.backend.repository;

import com.example.backend.entity.ServiceBooking;
import com.example.backend.entity.ServiceBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {

    @Query("""
        select coalesce(sum(b.quantity), 0)
        from ServiceBooking b
        where b.serviceSlot.id = :slotId and b.status = :status
    """)
    int sumQuantityBySlotAndStatus(Long slotId, ServiceBookingStatus status);
}
