package com.example.backend.controller;

import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.MeResponse;
import com.example.backend.dto.UpdateMeRequest;
import com.example.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    private Long currentUserId(Authentication auth) {
        Object p = auth.getPrincipal();
        if (p instanceof Long id) return id;
        if (p instanceof String s) return Long.valueOf(s);
        throw new RuntimeException("Unauthenticated");
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication auth) {
        return ResponseEntity.ok(accountService.getMe(currentUserId(auth)));
    }

    @PutMapping("/me")
    public ResponseEntity<MeResponse> updateMe(Authentication auth,
                                               @Valid @RequestBody UpdateMeRequest req) {
        return ResponseEntity.ok(accountService.updateMe(currentUserId(auth), req));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication auth,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePassword(currentUserId(auth), req);
        return ResponseEntity.ok().build();
    }
}
