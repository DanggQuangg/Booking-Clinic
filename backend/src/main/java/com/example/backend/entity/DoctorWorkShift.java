package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "doctor_work_shifts",
        indexes = {
                @Index(name = "idx_shift_date", columnList = "work_date, shift"),
                @Index(name = "idx_shift_doc_date", columnList = "doctor_id, work_date")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uk_doctor_date_shift",
                columnNames = {"doctor_id", "work_date", "shift"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorWorkShift {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false, length = 20)
    private ShiftType shift;

    @Column(name = "doctor_start_time", nullable = false)
    private LocalTime doctorStartTime;

    @Column(name = "doctor_end_time", nullable = false)
    private LocalTime doctorEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ClinicRoom room;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private WorkShiftStatus status = WorkShiftStatus.REGISTERED;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
