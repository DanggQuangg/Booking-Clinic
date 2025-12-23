package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(
        name = "appointment_slots",
        indexes = @Index(name = "idx_slot_shift", columnList = "work_shift_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_shift_time",
                columnNames = {"work_shift_id", "start_time", "end_time"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentSlot {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_shift_id", nullable = false)
    private DoctorWorkShift workShift;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "capacity", nullable = false)
    @Builder.Default
    private Integer capacity = 10;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private SlotStatus status = SlotStatus.ACTIVE; // bạn đang có enum SlotStatus sẵn
}
