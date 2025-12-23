package com.example.backend.repository;

import com.example.backend.entity.SlotStatus;
import com.example.backend.entity.User;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.entity.WorkShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<User, Long> {

    @Query("""
        select distinct u
        from User u
        join fetch u.doctorProfile dp
        where u.role = :role
          and u.status = :status
          and exists (
              select 1
              from com.example.backend.entity.DoctorSpecialty ds
              where ds.doctor.id = u.id
                and ds.specialty.id = :specialtyId
          )
          and exists (
              select 1
              from com.example.backend.entity.DoctorWorkShift ws
              join com.example.backend.entity.AppointmentSlot sl on sl.workShift.id = ws.id
              where ws.doctor.id = u.id
                and ws.workDate = :date
                and ws.status <> :cancelled
                and sl.status = :slotStatus
          )
        order by dp.isVerified desc, u.fullName asc
    """)
    List<User> findAvailableDoctorsBySpecialtyAndDate(
            @Param("specialtyId") Long specialtyId,
            @Param("date") LocalDate date,
            @Param("role") UserRole role,
            @Param("status") UserStatus status,
            @Param("slotStatus") SlotStatus slotStatus,
            @Param("cancelled") WorkShiftStatus cancelled
    );
}
