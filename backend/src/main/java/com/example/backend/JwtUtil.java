package com.example.backend;

import com.example.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // Secret key tối thiểu 32 ký tự
    private final String secret =
            "DAY_LA_MA_BI_MAT_RAT_DAI_CAN_PHAI_DU_32_KY_TU_ABC_XYZ_123";

    private final SecretKey key =
            Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

    // Thời gian hết hạn: 7 ngày
    private final long EXPIRATION_TIME = 7L * 24 * 60 * 60 * 1000;

    // =========================
    // GENERATE TOKEN
    // =========================
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();

        // Lưu thông tin cho FE
        claims.put("role", user.getRole().name());
        claims.put("fullName", user.getFullName());

        return createToken(claims, String.valueOf(user.getId()));
    }

    // =========================
    // READ CLAIMS
    // =========================
    public Long getUserId(String token) {
        return Long.valueOf(parse(token).getBody().getSubject());
    }

    public String getRole(String token) {
        try {
            return parse(token).getBody().get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    // =========================
    // INTERNAL
    // =========================
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // userId
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
