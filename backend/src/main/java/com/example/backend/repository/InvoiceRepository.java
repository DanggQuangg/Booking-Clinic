package com.example.backend.repository;

import com.example.backend.dto.InvoiceDto;
import com.example.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Appointment, Long> {

    @Query("""
        select new com.example.backend.dto.InvoiceDto(
            a.id,
            pp.fullName,
            d.fullName,
            sp.name,
            cast(a.appointmentDate as string),
            cast(s.startTime as string),
            cast(s.endTime as string),
            a.baseFee,
            a.insuranceDiscount,
            a.servicesAmount,
            a.totalAmount
        )
        from Appointment a
        join a.patientProfile pp
        join a.doctor d
        join a.specialty sp
        join a.slot s
        where a.id = :id
    """)
    InvoiceDto getInvoice(@Param("id") Long id);
}
