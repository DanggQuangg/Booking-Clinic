package com.example.backend.repository;

import com.example.backend.entity.ServiceCatalog;
import com.example.backend.entity.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {
    List<ServiceCatalog> findByStatus(ServiceStatus status);
}
