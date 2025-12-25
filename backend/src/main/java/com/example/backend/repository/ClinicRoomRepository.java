package com.example.backend.repository;

import com.example.backend.entity.ClinicRoom;
import com.example.backend.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClinicRoomRepository extends JpaRepository<ClinicRoom, Long> {
    Optional<ClinicRoom> findFirstByStatusOrderByIdAsc(RoomStatus status);
}
