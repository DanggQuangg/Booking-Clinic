import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // ✅ Import thư viện làm đẹp văn bản
import './Chatbot.css'; 

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false); // ✅ State quản lý phóng to
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi là **MediAssist**. Tôi có thể giúp bạn tra cứu **bảng giá**, **thông tin bác sĩ** hoặc **đặt lịch khám**.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc khi mở rộng cửa sổ
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isMaximized]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8088/api/chatbot/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Lỗi kết nối');
            const data = await response.json();
            
            const botText = data.text || data.answer || data.message || "Xin lỗi, tôi không hiểu câu trả lời.";
            setMessages(prev => [...prev, { sender: 'bot', text: botText }]);

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ **Lỗi kết nối:** Không thể liên lạc với máy chủ." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // Hàm chuyển đổi phóng to / thu nhỏ
    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <div className="chatbot-wrapper">
            
            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className={`chatbot-window ${isMaximized ? 'maximized' : ''}`}>
                    
                    {/* Header: Tên mới & Các nút điều khiển */}
                    <div className="chatbot-header">
                        <div className="header-title">
                            <span>🩺</span> MediAssist
                        </div>
                        <div className="header-controls">
                            {/* Nút phóng to / thu nhỏ */}
                            <button onClick={toggleMaximize} title={isMaximized ? "Thu nhỏ" : "Phóng to"}>
                                {isMaximized ? '❐' : '□'}
                            </button>
                            {/* Nút đóng (ẩn xuống) */}
                            <button onClick={() => setIsOpen(false)} title="Đóng chat">
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Nội dung tin nhắn */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                                {/* ✅ Dùng ReactMarkdown để hiển thị đẹp */}
                                {msg.sender === 'bot' ? (
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message bot-message">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ô nhập liệu */}
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập câu hỏi..."
                            autoFocus
                        />
                        <button onClick={handleSend} className="send-btn" disabled={isLoading}>
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Nút mở chat tròn (Chỉ hiện khi cửa sổ chat đóng) */}
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    💬
                </button>
            )}
        </div>
    );
};

export default Chatbot;