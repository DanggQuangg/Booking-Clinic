package com.example.backend.controller;

import com.example.backend.dto.SpecialtyPricingDto;
import com.example.backend.entity.ServiceCatalog;
import com.example.backend.entity.ServiceStatus;
import com.example.backend.repository.ServiceCatalogRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/public/pricing")
@RequiredArgsConstructor
public class PublicPricingController {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final EntityManager em;

    @GetMapping("/services")
    public List<ServiceCatalog> listServices() {
        // chỉ lấy ACTIVE để đưa ra bảng giá
        return serviceCatalogRepository.findByStatus(ServiceStatus.ACTIVE);
    }

    @GetMapping("/specialties")
    public List<SpecialtyPricingDto> listSpecialtyPricing() {
        // min/max fee theo consultation_fee của bác sĩ thuộc chuyên khoa
        String jpql = """
            select sp.id, sp.name, sp.description,
                   coalesce(min(dp.consultationFee), 0),
                   coalesce(max(dp.consultationFee), 0),
                   count(distinct u.id)
            from Specialty sp
            left join DoctorSpecialty ds on ds.specialty.id = sp.id
            left join User u on u.id = ds.doctor.id
            left join DoctorProfile dp on dp.userId = u.id
            group by sp.id, sp.name, sp.description
            order by sp.name asc
        """;

        TypedQuery<Object[]> q = em.createQuery(jpql, Object[].class);
        List<Object[]> rows = q.getResultList();

        List<SpecialtyPricingDto> out = new ArrayList<>();
        for (Object[] r : rows) {
            out.add(SpecialtyPricingDto.builder()
                    .id((Long) r[0])
                    .name((String) r[1])
                    .description((String) r[2])
                    .minFee((BigDecimal) r[3])
                    .maxFee((BigDecimal) r[4])
                    .doctorCount((Long) r[5])
                    .build());
        }
        return out;
    }
}
