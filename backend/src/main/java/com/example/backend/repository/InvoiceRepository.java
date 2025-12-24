package com.example.backend.repository;

import com.example.backend.dto.InvoiceDto;
import com.example.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Appointment, Long> {

    @Query(value = """
        SELECT
            a.id                    AS appointmentId,
            pp.full_name            AS patientName,
            u.full_name             AS doctorName,
            sp.name                 AS specialtyName,
            a.appointment_date      AS appointmentDate,
            sl.start_time           AS startTime,
            sl.end_time             AS endTime,
            a.base_fee              AS baseFee,
            a.insurance_discount    AS insuranceDiscount,
            a.services_amount       AS servicesAmount,
            a.total_amount          AS totalAmount,
            a.payment_status        AS paymentStatus,
            a.paid_at               AS paidAt
        FROM appointments a
        JOIN patient_profiles pp    ON pp.id = a.patient_profile_id
        JOIN users u                ON u.id = a.doctor_id
        JOIN specialties sp         ON sp.id = a.specialty_id
        JOIN appointment_slots sl   ON sl.id = a.slot_id
        WHERE a.id = :appointmentId
        """, nativeQuery = true)
    InvoiceDto getInvoice(@Param("appointmentId") Long appointmentId);
}
