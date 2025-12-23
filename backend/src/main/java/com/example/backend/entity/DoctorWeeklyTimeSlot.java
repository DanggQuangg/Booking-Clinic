package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "appointment_slots") // Map vào bảng appointment_slots
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorWeeklyTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // QUAN TRỌNG: Tên biến này phải là 'doctorWorkShift' để khớp với Repository
    @ManyToOne(fetch = FetchType.EAGER) // Để EAGER cho tiện lấy dữ liệu
    @JoinColumn(name = "work_shift_id", nullable = false)
    private DoctorWorkShift doctorWorkShift;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "capacity", nullable = false)
    @Builder.Default
    private Integer capacity = 10;

    // Lưu status dạng String cho đơn giản, tránh lỗi Enum lệch
    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}