package com.example.backend.dto;

import com.example.backend.entity.ServiceCatalog;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServiceCatalogDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String status;

    public static ServiceCatalogDto from(ServiceCatalog s) {
        return ServiceCatalogDto.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .price(s.getPrice())
                .status(s.getStatus() == null ? null : s.getStatus().name())
                .build();
    }
}
