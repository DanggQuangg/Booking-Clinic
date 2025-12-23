package com.example.backend.repository;

import com.example.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
        select count(a) from Appointment a
        where a.slot.id = :slotId
          and a.appointmentDate = :date
          and a.status <> com.example.backend.entity.AppointmentStatus.CANCELLED
    """)
    long countBooked(@Param("slotId") Long slotId,
                     @Param("date") LocalDate date);
}
