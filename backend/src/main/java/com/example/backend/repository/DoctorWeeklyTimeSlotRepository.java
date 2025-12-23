package com.example.backend.repository;

import com.example.backend.entity.DoctorWeeklyTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorWeeklyTimeSlotRepository extends JpaRepository<DoctorWeeklyTimeSlot, Long> {
    // Spring tự động JOIN bảng doctorWorkShift để tìm theo doctorId
    List<DoctorWeeklyTimeSlot> findAllByDoctorWorkShift_DoctorIdOrderByDoctorWorkShift_WorkDateAscStartTimeAsc(Long doctorId);
}