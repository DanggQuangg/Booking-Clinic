package com.example.backend.dto;

import com.example.backend.entity.PatientProfile;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientProfileSimpleDto {
    private Long id;
    private String fullName;
    private String phone;
    private String dob;     // yyyy-MM-dd
    private String gender;  // MALE/FEMALE/...
    private Boolean isDefault;

    public static PatientProfileSimpleDto from(PatientProfile p) {
        return PatientProfileSimpleDto.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .phone(p.getPhone())
                .dob(p.getDob() == null ? null : p.getDob().toString())
                .gender(p.getGender() == null ? null : p.getGender().name())
                .isDefault(Boolean.TRUE.equals(p.getIsDefault()))
                .build();
    }
}
