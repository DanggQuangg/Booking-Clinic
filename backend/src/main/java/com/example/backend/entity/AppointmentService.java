package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_services",
        indexes = {
                @Index(name = "idx_appt_srv_appt", columnList = "appointment_id"),
                @Index(name = "idx_appt_srv_service", columnList = "service_id")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_appt_service", columnNames = {"appointment_id","service_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentService {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceCatalog service;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;
}
