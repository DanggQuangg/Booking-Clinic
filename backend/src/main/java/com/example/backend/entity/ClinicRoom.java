package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clinic_rooms", uniqueConstraints = {
        @UniqueConstraint(name = "uk_room_name", columnNames = "room_name")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClinicRoom {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name", nullable = false, length = 30)
    private String roomName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;
}
