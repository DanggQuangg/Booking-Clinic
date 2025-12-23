package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialties", uniqueConstraints = {
        @UniqueConstraint(name = "uk_specialties_name", columnNames = "name")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Specialty {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
