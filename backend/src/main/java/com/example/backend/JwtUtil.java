package com.example.backend;

import com.example.backend.entity.User; // Import User Entity
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
    // Secret key phải đủ dài (>= 32 ký tự)
    private final String secret = "DAY_LA_MA_BI_MAT_RAT_DAI_CAN_PHAI_DU_32_KY_TU_ABC_XYZ_123";
    private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

    // Thời gian hết hạn: 7 ngày
    private final long EXPIRATION_TIME = 7L * 24 * 60 * 60 * 1000; 

    // ✅ Hàm generateToken nhận vào User để lấy Role và Tên
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        // Lưu Role và Tên vào token để Frontend dùng
        claims.put("role", user.getRole().name());
        claims.put("fullName", user.getFullName());

        return createToken(claims, String.valueOf(user.getId()));
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // ID của user
                .setIssuedAt(new Date(System.currentTimeMillis()))
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

    public Long getUserId(String token) {
        String sub = parse(token).getBody().getSubject();
        return Long.valueOf(sub);
    }
}