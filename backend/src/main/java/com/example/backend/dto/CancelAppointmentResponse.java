package com.example.backend.dto;

public class CancelAppointmentResponse {
    private Long appointmentId;
    private String status;
    private String message;

    public CancelAppointmentResponse() {}

    public CancelAppointmentResponse(Long appointmentId, String status, String message) {
        this.appointmentId = appointmentId;
        this.status = status;
        this.message = message;
    }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
