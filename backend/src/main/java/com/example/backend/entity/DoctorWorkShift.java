package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_work_shifts") // Khớp bảng SQL
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorWorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId; // Lưu ID bác sĩ (User)

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate; // Ngày làm việc cụ thể

    @Column(name = "shift", nullable = false)
    private String shift; // "MORNING" hoặc "AFTERNOON"

    @Column(name = "doctor_start_time", nullable = false)
    private LocalTime doctorStartTime;

    @Column(name = "doctor_end_time", nullable = false)
    private LocalTime doctorEndTime;

    @Column(name = "room_id", nullable = false)
    private Long roomId; // ID phòng khám

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "REGISTERED"; // "REGISTERED", "APPROVED", "CANCELLED"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "REGISTERED";
    }
}