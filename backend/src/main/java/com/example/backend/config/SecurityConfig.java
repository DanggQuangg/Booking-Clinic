package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Các API công khai (không cần đăng nhập)
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/chatbot/**",
                                "/api/doctor/**"
                        ).permitAll()

                        // 2. Các API yêu cầu đã đăng nhập (User/Patient/Doctor)
                        .requestMatchers(
                                "/api/patient/**",
                                "/api/service-bookings/**",
                                "/api/account/**"
                        ).authenticated()

                        // 3. API dành riêng cho nội bộ Bác sĩ (cần Role DOCTOR)
                        .requestMatchers("/api/doctor-internal/**").hasAuthority("DOCTOR")

                        // 4. Tất cả các request khác phải được xác thực
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                // Luôn mã hóa BCrypt cho người dùng mới đăng ký
                return new BCryptPasswordEncoder().encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                // 1. Xử lý trường hợp dữ liệu rác (fake hash) trong DB
                if (encodedPassword.contains("dummy")) {
                    // Nếu nhập 123456 hoặc nhập đúng chuỗi rác đó thì cho qua
                    return "123456".equals(rawPassword.toString()) || encodedPassword.equals(rawPassword.toString());
                }

                // 2. Xử lý trường hợp mật khẩu Bệnh nhân (BCrypt chuẩn)
                if (encodedPassword.startsWith("$2a$") && encodedPassword.length() == 60) {
                    return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
                }

                // 3. Xử lý trường hợp mật khẩu Bác sĩ (Plaintext / Văn bản thuần)
                return rawPassword.toString().equals(encodedPassword);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép Frontend truy cập (Cập nhật port nếu Frontend chạy port khác)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}