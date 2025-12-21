package com.example.backend;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    // tối thiểu 32 ký tự
    private final String secret = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32+";
    private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String subject) {
        long now = System.currentTimeMillis();
        long exp = now + 7L * 24 * 60 * 60 * 1000; // 7 ngày

        return Jwts.builder()
                .setSubject(subject) // có thể là userId hoặc phone
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .signWith(key)
                .compact();
    }
}

