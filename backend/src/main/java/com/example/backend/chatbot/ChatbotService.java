package com.example.backend.chatbot;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final DynamicQueryService dbService;

    @Value("${gemini.api.key}")
    private String apiKey;

    // Sử dụng bản 1.5 Flash (Bản ổn định nhất)
    private static final String MODEL_NAME = "gemini-2.5-flash";
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL_NAME + ":generateContent?key=%s";

    private final RestTemplate restTemplate = new RestTemplate();
    private String knowledgeBase = "";

    public String chat(String userMessage) {
        try {
            // 1. Đọc file nghiệp vụ (.md)
            if (knowledgeBase.isEmpty()) loadKnowledgeFiles();

            // 2. Lấy giá khám Bác sĩ (Theo chuyên khoa)
            String doctorPrices = dbService.getPriceListBySpecialty();

            // 3. Lấy giá Dịch vụ kỹ thuật (Xét nghiệm, Siêu âm...) - MỚI
            String servicePrices = dbService.getTechnicalServicesList();

            // 4. Xây dựng System Prompt
            // Lưu ý: Đã tránh dùng ký tự '%' gây lỗi định dạng Java
            String systemPrompt = """
                BẠN LÀ 'MEDIASSIST' - TRỢ LÝ Y TẾ THÔNG MINH CỦA PHÒNG KHÁM BOOKING CLINIC.
                
                === QUYỀN HẠN & GIỚI HẠN ===
                - Bạn được phép dùng kiến thức y khoa để suy luận chuyên khoa cần khám.
                - KHÔNG kê đơn thuốc.
                - KHÔNG khẳng định bệnh chắc chắn (luôn dùng từ "có thể", "nguy cơ").
                - Luôn khuyên khách hàng đặt lịch khám để có kết quả chính xác.
                
                === DỮ LIỆU 1: GIÁ KHÁM BÁC SĨ (Theo chuyên khoa) ===
                %s
                
                === DỮ LIỆU 2: GIÁ DỊCH VỤ KỸ THUẬT (Xét nghiệm, Siêu âm, Chụp chiếu...) ===
                %s
                
                === NGHIỆP VỤ HỆ THỐNG (Từ tài liệu) ===
                %s
                
                === HƯỚNG DẪN TRẢ LỜI GIÁ ===
                - Nếu khách hỏi "Giá khám tim mạch/da liễu...": Dùng DỮ LIỆU 1.
                - Nếu khách hỏi "Giá xét nghiệm máu/Test COVID/Siêu âm...": Dùng DỮ LIỆU 2.
                - Nếu khách hỏi "Giá chữa bệnh X": Suy luận bệnh X thuộc khoa nào -> Báo giá khám khoa đó.
                
                Câu hỏi của khách: "%s"
                """.formatted(doctorPrices, servicePrices, knowledgeBase, userMessage);

            return callGeminiApi(systemPrompt);

        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, hệ thống đang bận hoặc gặp sự cố kết nối AI.";
        }
    }

    private void loadKnowledgeFiles() {
        try {
            ClassPathResource mdFile = new ClassPathResource("knowledge/nghiep_vu.md");
            this.knowledgeBase = StreamUtils.copyToString(mdFile.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            this.knowledgeBase = "Chưa có tài liệu nghiệp vụ.";
        }
    }

    private String callGeminiApi(String prompt) {
        try {
            String url = String.format(GEMINI_URL, apiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            ));

            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            return extractText(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi kết nối với máy chủ AI (Google Gemini).";
        }
    }

    private String extractText(Map<String, Object> response) {
        try {
            if (response == null) return "AI không phản hồi.";
            List<Map> candidates = (List<Map>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "AI không trả lời được.";

            Map content = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "Lỗi xử lý phản hồi.";
        }
    }
}