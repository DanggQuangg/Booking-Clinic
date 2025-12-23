package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "doctor_weekly_time_slots",
        indexes = @Index(name = "idx_doc_dow", columnList = "doctor_id, day_of_week"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_doc_weekly_slot",
                columnNames = {"doctor_id","day_of_week","start_time","end_time","room_id"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorWeeklyTimeSlot {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1..7

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ClinicRoom room;

    @Column(name = "capacity", nullable = false)
    @Builder.Default
    private Integer capacity = 10;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private SlotStatus status = SlotStatus.ACTIVE;
}
