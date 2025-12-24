package com.example.backend.service;

import com.example.backend.dto.ServiceBookingCreateRequest;
import com.example.backend.dto.ServiceBookingCreateResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ServiceBookingService {

    private final ServiceTimeSlotRepository slotRepo;
    private final ServiceBookingRepository bookingRepo;
    private final PatientProfileRepository profileRepo;
    private final UserRepository userRepo;
    private final AppointmentRepository appointmentRepo; // nếu không dùng appointment thì có thể bỏ

    public ServiceBookingService(
            ServiceTimeSlotRepository slotRepo,
            ServiceBookingRepository bookingRepo,
            PatientProfileRepository profileRepo,
            UserRepository userRepo,
            AppointmentRepository appointmentRepo
    ) {
        this.slotRepo = slotRepo;
        this.bookingRepo = bookingRepo;
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
        this.appointmentRepo = appointmentRepo;
    }

    @Transactional
    public ServiceBookingCreateResponse create(Long userId, ServiceBookingCreateRequest req) {

        // 1) slot
        ServiceTimeSlot slot = slotRepo.findById(req.getServiceSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy service slot."));

        // 2) service lấy từ slot (không cần requires_booking)
        ServiceCatalog service = slot.getService();
        if (service == null) {
            throw new IllegalArgumentException("Slot không hợp lệ (thiếu service).");
        }

        // 3) profile phải thuộc user đang đăng nhập
        PatientProfile profile = profileRepo
                .findByIdAndOwnerUser_Id(req.getPatientProfileId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Hồ sơ bệnh nhân không hợp lệ."));

        // 4) user
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại."));

        // 5) quantity
        int newQty = (req.getQuantity() == null ? 1 : req.getQuantity());
        if (newQty < 1) throw new IllegalArgumentException("Số lượng phải >= 1.");

        // 6) capacity check (tổng quantity BOOKED)
        int bookedQty = bookingRepo.sumQuantityBySlotAndStatus(slot.getId(), ServiceBookingStatus.BOOKED);
        if (bookedQty + newQty > slot.getCapacity()) {
            throw new IllegalArgumentException("Slot đã đầy. Vui lòng chọn slot khác.");
        }

        // 7) optional appointment
        Appointment appt = null;


        // 8) snapshot giá
        BigDecimal unitPrice = service.getPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(newQty));

        // 9) tạo booking
        ServiceBooking booking = ServiceBooking.builder()
                .serviceSlot(slot)
                .service(service)
                .patientUser(user)
                .patientProfile(profile)
                .appointment(appt) // nếu không dùng appointment thì xóa dòng này
                .quantity(newQty)
                .unitPrice(unitPrice)
                .lineTotal(lineTotal)
                .note(req.getNote())
                .status(ServiceBookingStatus.BOOKED)
                .build();

        bookingRepo.save(booking);

        return ServiceBookingCreateResponse.builder()
                .id(booking.getId())
                .serviceId(service.getId())
                .serviceSlotId(slot.getId())
                .quantity(booking.getQuantity())
                .unitPrice(booking.getUnitPrice())
                .lineTotal(booking.getLineTotal())
                .status(booking.getStatus().name())
                .build();
    }
}
