package com.example.backend.repository;

import com.example.backend.entity.DoctorWeeklyTimeSlot;
import com.example.backend.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorWeeklyTimeSlotRepository extends JpaRepository<DoctorWeeklyTimeSlot, Long> {
    List<DoctorWeeklyTimeSlot> findByDoctor_IdAndDayOfWeekAndStatusOrderByStartTimeAsc(
            Long doctorId, Integer dayOfWeek, SlotStatus status
    );
    List<DoctorWeeklyTimeSlot> findAllByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(Long doctorId);

}
