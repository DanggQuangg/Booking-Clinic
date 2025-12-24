package com.example.backend.service;

import com.example.backend.JwtUtil; 
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    // --- Đăng ký (Dành cho Web User - Mã hóa BCrypt chuẩn) ---
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByPhone(req.phone())) throw new RuntimeException("Số điện thoại đã tồn tại.");

        User u = User.builder()
                .fullName(req.fullName().trim())
                .phone(req.phone().trim())
                .email(req.email() != null ? req.email().trim() : null)
                .passwordHash(encoder.encode(req.password())) // Luôn mã hóa khi đăng ký mới
                .role(com.example.backend.entity.UserRole.PATIENT)
                .status(com.example.backend.entity.UserStatus.ACTIVE)
                .build();

        u = userRepo.save(u);
        String token = jwt.generateToken(u);
        return new AuthResponse(token, u.getRole().name(), u.getFullName());
    }

    // --- Đăng nhập (Xử lý Hybrid: Demo & Real) ---
    public AuthResponse login(LoginRequest req) {
        User u = userRepo.findByPhone(req.phone().trim())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        String inputPwd = req.password();
        String dbPwd = u.getPasswordHash();
        boolean isMatch = false;

        // --- LOGIC KIỂM TRA MẬT KHẨU ---

        // 1. Dành cho DATA DEMO trong SQL (Có chứa chữ 'dummy')
        // DB lưu: $2a$10$dummyhashdoc01
        // -> Cắt bỏ "$2a$10$" (7 ký tự đầu) -> Còn lại "dummyhashdoc01"
        if (dbPwd.startsWith("$2a$10$dummy")) {
             String realPasswordOfDemo = dbPwd.substring(7); // Lấy phần đuôi làm mật khẩu
             if (inputPwd.equals(realPasswordOfDemo)) {
                 isMatch = true;
             }
        } 
        // 2. Dành cho USER THẬT (Đăng ký trên web -> Hash BCrypt chuẩn)
        else {
             if (encoder.matches(inputPwd, dbPwd)) {
                 isMatch = true;
             }
        }

        if (!isMatch) {
            throw new RuntimeException("Sai số điện thoại hoặc mật khẩu.");
        }

        String token = jwt.generateToken(u);
        return new AuthResponse(token, u.getRole().name(), u.getFullName());
    }
}