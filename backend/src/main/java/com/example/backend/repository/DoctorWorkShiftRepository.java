package com.example.backend.repository;

import com.example.backend.entity.DoctorWorkShift;
import com.example.backend.entity.WorkShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DoctorWorkShiftRepository extends JpaRepository<DoctorWorkShift, Long> {

    @Query("""
        select ws
        from DoctorWorkShift ws
        join fetch ws.room r
        where ws.doctor.id = :doctorId
          and ws.workDate between :from and :to
          and ws.status <> :cancelled
        order by ws.workDate asc, ws.shift asc
    """)
    List<DoctorWorkShift> findScheduleRange(
            @Param("doctorId") Long doctorId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("cancelled") WorkShiftStatus cancelled
    );
}
