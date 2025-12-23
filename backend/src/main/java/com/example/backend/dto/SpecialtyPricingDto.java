package com.example.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SpecialtyPricingDto {
    private Long id;
    private String name;
    private String description;

    private BigDecimal minFee;
    private BigDecimal maxFee;
    private Long doctorCount;
}
