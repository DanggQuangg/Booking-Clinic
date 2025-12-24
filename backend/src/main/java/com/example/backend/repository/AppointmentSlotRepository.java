package com.example.backend.repository;

import com.example.backend.entity.AppointmentSlot;
import com.example.backend.entity.SlotStatus;
import com.example.backend.entity.WorkShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    @Query("""
        select s
        from AppointmentSlot s
        join fetch s.workShift ws
        join fetch ws.room r
        where ws.doctor.id = :doctorId
          and ws.workDate = :workDate
          and ws.status <> :cancelled
          and s.status = :slotStatus
        order by s.startTime asc
    """)
    List<AppointmentSlot> findActiveSlotsByDoctorAndDate(
            @Param("doctorId") Long doctorId,
            @Param("workDate") LocalDate workDate,
            @Param("slotStatus") SlotStatus slotStatus,
            @Param("cancelled") WorkShiftStatus cancelled
    );
    @Query("""
        select s
        from AppointmentSlot s
        where s.workShift.id in :shiftIds
        order by s.workShift.id asc, s.startTime asc
    """)
    List<AppointmentSlot> findByShiftIds(@Param("shiftIds") List<Long> shiftIds);
}
