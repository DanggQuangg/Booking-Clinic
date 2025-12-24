package com.example.backend.repository;

import com.example.backend.entity.ClinicRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicRoomRepository extends JpaRepository<ClinicRoom, Long> {
}
