package com.example.backend.chatbot;


import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping(value = "/ask", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");

        // Gọi AI xử lý
        String aiResponse = chatbotService.chat(userMessage);

        // ✅ Gửi về Map chứa nhiều key khác nhau để "bao vây" Frontend
        Map<String, String> response = new HashMap<>();
        response.put("text", aiResponse);    // Key thường dùng 1
        response.put("message", aiResponse); // Key thường dùng 2
        response.put("reply", aiResponse);   // Key thường dùng 3
        response.put("answer", aiResponse);  // Key thường dùng 4
        response.put("content", aiResponse); // Key thường dùng 5

        return ResponseEntity.ok(response);
    }
}