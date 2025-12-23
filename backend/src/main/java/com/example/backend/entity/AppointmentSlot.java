package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointment_slots") // ✅ QUAN TRỌNG: Phải khớp tên bảng trong SQL
public class AppointmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với bảng doctor_work_shifts qua khóa ngoại work_shift_id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "work_shift_id", nullable = false)
    private DoctorWorkShift workShift;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer capacity;

    // Trong SQL là ENUM('ACTIVE','INACTIVE'), ở đây dùng String cho đơn giản
    @Column(nullable = false)
    private String status; 
}