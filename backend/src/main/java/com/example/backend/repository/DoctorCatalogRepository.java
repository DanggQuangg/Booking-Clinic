package com.example.backend.repository;

import com.example.backend.dto.DoctorPublicDto;
import com.example.backend.entity.SlotStatus;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorCatalogRepository extends JpaRepository<User, Long> {

    @Query("""
        select distinct new com.example.backend.dto.DoctorPublicDto(
            u.id, u.fullName, dp.avatarUrl, dp.degree, dp.positionTitle, dp.consultationFee, dp.isVerified
        )
        from User u
        join u.doctorProfile dp
        where u.role = :doctorRole
          and u.status = :activeStatus
          and exists (
              select 1 from com.example.backend.entity.DoctorSpecialty ds
              where ds.doctor.id = u.id and ds.specialty.id = :specialtyId
          )
          and exists (
              select 1 from com.example.backend.entity.DoctorWeeklyTimeSlot s
              where s.doctor.id = u.id
                and s.dayOfWeek = :dayOfWeek
                and s.status = :slotActive
          )
        order by dp.isVerified desc, u.fullName asc
    """)
    List<DoctorPublicDto> findAvailableDoctors(
            @Param("specialtyId") Long specialtyId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("doctorRole") UserRole doctorRole,
            @Param("activeStatus") UserStatus activeStatus,
            @Param("slotActive") SlotStatus slotActive
    );
}
