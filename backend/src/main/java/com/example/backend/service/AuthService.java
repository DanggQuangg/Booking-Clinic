package com.example.backend.service;

import com.example.backend.JwtUtil;
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwt) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByPhone(req.phone())) throw new RuntimeException("Số điện thoại đã tồn tại.");
        if (userRepo.existsByEmail(req.email())) throw new RuntimeException("Email đã tồn tại.");

        User u = User.builder()
                .fullName(req.fullName().trim())
                .phone(req.phone().trim())
                .email(req.email().trim())
                .passwordHash(encoder.encode(req.password()))
                .build();

        u = userRepo.save(u);

        String token = jwt.generateToken(u.getPhone());
        return new AuthResponse(u.getFullName(), u.getPhone(), u.getEmail(), token);
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepo.findByPhone(req.phone().trim())
                .orElseThrow(() -> new RuntimeException("Sai số điện thoại hoặc mật khẩu."));

        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new RuntimeException("Sai số điện thoại hoặc mật khẩu.");
        }

        String token = jwt.generateToken(u.getPhone());
        return new AuthResponse(u.getFullName(), u.getPhone(), u.getEmail(), token);
    }
}

