package com.example.backend.repository;

import com.example.backend.dto.PatientAppointmentDto;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
        select count(a) from Appointment a
        where a.slot.id = :slotId
          and a.appointmentDate = :date
          and a.status <> com.example.backend.entity.AppointmentStatus.CANCELLED
    """)
    long countBooked(@Param("slotId") Long slotId,
                     @Param("date") LocalDate date);


        @Query("""
        select new com.example.backend.dto.PatientAppointmentDto(
            a.id,
            a.appointmentDate,
            sl.startTime,
            sl.endTime,

            a.patientProfileId,
            pp.fullName,

            d.id,
            d.fullName,

            sp.id,
            sp.name,

            r.id,
            r.roomName,

            cast(a.status as string),
            cast(a.paymentStatus as string),

            a.totalAmount,
            a.baseFee,
            a.insuranceDiscount,
            a.servicesAmount,

            a.note,
            a.createdAt
        )
        from Appointment a
        join a.slot sl
        join a.doctor d
        join a.specialty sp
        join a.room r
        left join a.patientProfile pp
        where a.patientUser.id = :userId
          and a.status = 'DONE'
          and (
               :q is null or :q = '' or
               lower(pp.fullName) like lower(concat('%', :q, '%')) or
               lower(d.fullName)  like lower(concat('%', :q, '%')) or
               lower(sp.name)     like lower(concat('%', :q, '%')) or
               lower(r.roomName)  like lower(concat('%', :q, '%')) or
               cast(a.id as string) like concat('%', :q, '%')
          )
        order by a.appointmentDate desc, sl.startTime desc
    """)
        Page<PatientAppointmentDto> findDone(@Param("userId") Long userId,
                                             @Param("q") String q,
                                             Pageable pageable);

        @Query("""
        select new com.example.backend.dto.PatientAppointmentDto(
            a.id,
            a.appointmentDate,
            sl.startTime,
            sl.endTime,

            a.patientProfileId,
            pp.fullName,

            d.id,
            d.fullName,

            sp.id,
            sp.name,

            r.id,
            r.roomName,

            cast(a.status as string),
            cast(a.paymentStatus as string),

            a.totalAmount,
            a.baseFee,
            a.insuranceDiscount,
            a.servicesAmount,

            a.note,
            a.createdAt
        )
        from Appointment a
        join a.slot sl
        join a.doctor d
        join a.specialty sp
        join a.room r
        left join a.patientProfile pp
        where a.patientUser.id = :userId
          and a.status = 'AWAITING_PAYMENT'
          and a.paymentStatus = 'UNPAID'
          and (
               :q is null or :q = '' or
               lower(pp.fullName) like lower(concat('%', :q, '%')) or
               lower(d.fullName)  like lower(concat('%', :q, '%')) or
               lower(sp.name)     like lower(concat('%', :q, '%')) or
               lower(r.roomName)  like lower(concat('%', :q, '%')) or
               cast(a.id as string) like concat('%', :q, '%')
          )
        order by a.appointmentDate desc, sl.startTime desc
    """)
        Page<PatientAppointmentDto> findRegistered(@Param("userId") Long userId,
                                                   @Param("q") String q,
                                                   Pageable pageable);

        @Query("""
        select new com.example.backend.dto.PatientAppointmentDto(
            a.id,
            a.appointmentDate,
            sl.startTime,
            sl.endTime,

            a.patientProfileId,
            pp.fullName,

            d.id,
            d.fullName,

            sp.id,
            sp.name,

            r.id,
            r.roomName,

            cast(a.status as string),
            cast(a.paymentStatus as string),

            a.totalAmount,
            a.baseFee,
            a.insuranceDiscount,
            a.servicesAmount,

            a.note,
            a.createdAt
        )
        from Appointment a
        join a.slot sl
        join a.doctor d
        join a.specialty sp
        join a.room r
        left join a.patientProfile pp
        where a.patientUser.id = :userId
          and a.status = 'CONFIRMED'
          and a.appointmentDate >= :today
          and (
               :q is null or :q = '' or
               lower(pp.fullName) like lower(concat('%', :q, '%')) or
               lower(d.fullName)  like lower(concat('%', :q, '%')) or
               lower(sp.name)     like lower(concat('%', :q, '%')) or
               lower(r.roomName)  like lower(concat('%', :q, '%')) or
               cast(a.id as string) like concat('%', :q, '%')
          )
        order by a.appointmentDate asc, sl.startTime asc
    """)
        Page<PatientAppointmentDto> findUpcoming(@Param("userId") Long userId,
                                                 @Param("today") LocalDate today,
                                                 @Param("q") String q,
                                                 Pageable pageable);
    boolean existsByPatientProfileId(Long patientProfileId);

    long countByPatientProfileIdAndStatusIn(Long patientProfileId, Collection<AppointmentStatus> statuses);

    @Query("""
           select count(a) from Appointment a
           where a.patientProfileId = :profileId
             and a.status in :statuses
             and a.appointmentDate >= :fromDate
           """)
    long countUpcoming(
            @Param("profileId") Long profileId,
            @Param("statuses") Collection<AppointmentStatus> statuses,
            @Param("fromDate") LocalDate fromDate
    );
}

