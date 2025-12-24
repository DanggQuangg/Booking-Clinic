package com.example.backend.service;

import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.MeResponse;
import com.example.backend.dto.UpdateMeRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public AccountService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    public MeResponse getMe(Long userId) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại."));
        return new MeResponse(u.getId(), u.getFullName(), u.getPhone(), u.getEmail());
    }

    public MeResponse updateMe(Long userId, UpdateMeRequest req) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại."));

        // Không cho đổi phone (đúng yêu cầu)
        u.setFullName(req.fullName().trim());
        u.setEmail(req.email() == null ? null : req.email().trim());

        User saved = userRepo.save(u);
        return new MeResponse(saved.getId(), saved.getFullName(), saved.getPhone(), saved.getEmail());
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại."));

        if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng.");
        }

        u.setPasswordHash(encoder.encode(req.newPassword()));
        userRepo.save(u);
    }
}
