package com.example.backend.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.sql.*;
import java.util.*;

@Service
public class DynamicQueryService {

    @Value("${chatbot.datasource.url}") private String dbUrl;
    @Value("${chatbot.datasource.username}") private String dbUser;
    @Value("${chatbot.datasource.password}") private String dbPass;



    // 3. Lấy khung giá khám theo Chuyên khoa (Từ bảng doctors)
    public String getPriceListBySpecialty() {
        StringBuilder sb = new StringBuilder();
        String sql = """
            SELECT s.name as specialty_name, 
                   MIN(d.price) as min_price, 
                   MAX(d.price) as max_price
            FROM specialties s
            JOIN doctors d ON s.id = d.specialty_id
            GROUP BY s.name
        """;
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            sb.append("| Chuyên khoa | Giá khám (Bác sĩ) |\n| --- | --- |\n");
            while (rs.next()) {
                String name = rs.getString("specialty_name");
                double min = rs.getDouble("min_price");
                double max = rs.getDouble("max_price");
                String priceStr = (min == max) ? String.format("%,.0f VNĐ", min) : String.format("%,.0f - %,.0f VNĐ", min, max);
                sb.append(String.format("| %s | %s |\n", name, priceStr));
            }
        } catch (Exception e) { return "Chưa có dữ liệu giá bác sĩ."; }
        return sb.toString();
    }

    // 4. ✅ HÀM MỚI: Lấy bảng giá Dịch vụ Kỹ thuật (Test COVID, Siêu âm...) từ bảng 'services'
    public String getTechnicalServicesList() {
        StringBuilder sb = new StringBuilder();
        // SQL truy vấn bảng services (id, name, price, description)
        String sql = "SELECT name, price, description FROM services WHERE status = 'ACTIVE'";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            sb.append("| Tên dịch vụ | Giá niêm yết | Mô tả |\n| --- | --- | --- |\n");
            while (rs.next()) {
                String name = rs.getString("name");
                double price = rs.getDouble("price");
                String desc = rs.getString("description");
                String priceStr = String.format("%,.0f VNĐ", price);

                sb.append(String.format("| %s | %s | %s |\n", name, priceStr, desc));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Chưa có dữ liệu dịch vụ kỹ thuật.";
        }
        return sb.toString();
    }
}