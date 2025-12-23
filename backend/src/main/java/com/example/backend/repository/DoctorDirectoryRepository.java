package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.entity.UserRole;
import com.example.backend.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorDirectoryRepository extends JpaRepository<User, Long> {

    @Query("""
        select distinct u
        from User u
        join fetch u.doctorProfile dp
        where u.role = :role
          and u.status = :status
          and (:q is null or lower(u.fullName) like lower(concat('%', :q, '%')))
          and (
              :specialtyId is null
              or exists (
                   select 1 from com.example.backend.entity.DoctorSpecialty ds
                   where ds.doctor.id = u.id and ds.specialty.id = :specialtyId
              )
          )
        order by dp.isVerified desc, u.fullName asc
    """)
    List<User> searchDoctors(
            @Param("q") String q,
            @Param("specialtyId") Long specialtyId,
            @Param("role") UserRole role,
            @Param("status") UserStatus status
    );

    @Query("""
        select u
        from User u
        join fetch u.doctorProfile dp
        where u.id = :id and u.role = :role and u.status = :status
    """)
    User findDoctorByIdOrNull(
            @Param("id") Long id,
            @Param("role") UserRole role,
            @Param("status") UserStatus status
    );
}
