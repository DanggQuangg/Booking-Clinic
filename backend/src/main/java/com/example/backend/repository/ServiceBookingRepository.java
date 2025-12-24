package com.example.backend.repository;

import com.example.backend.entity.ServiceBooking;
import com.example.backend.entity.ServiceBookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {

    @Query("""
        select coalesce(sum(b.quantity), 0)
        from ServiceBooking b
        where b.serviceSlot.id = :slotId and b.status = :status
    """)
    int sumQuantityBySlotAndStatus(Long slotId, ServiceBookingStatus status);
    @Query("""
        select b
        from ServiceBooking b
          join b.service s
          join b.serviceSlot sl
        where b.patientUser.id = :userId
          and (:q is null or lower(s.name) like lower(concat('%', :q, '%')))
          and (:fromDate is null or sl.slotDate >= :fromDate)
          and (:toDate is null or sl.slotDate <= :toDate)
          and (:status is null or b.status = :status)
        """)
    Page<ServiceBooking> findMyHistory(
            @Param("userId") Long userId,
            @Param("q") String q,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") ServiceBookingStatus status,
            Pageable pageable
    );
}
