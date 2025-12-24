package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String role;     // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
    private String fullName; 
}