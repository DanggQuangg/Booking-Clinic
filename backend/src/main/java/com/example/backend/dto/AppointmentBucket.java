package com.example.backend.dto;

public enum AppointmentBucket {
    UPCOMING,     // lịch hẹn khám (CONFIRMED, ngày >= hôm nay)
    REGISTERED,   // đã đăng ký (AWAITING_PAYMENT, UNPAID)
    DONE          // đã khám (DONE)
}
