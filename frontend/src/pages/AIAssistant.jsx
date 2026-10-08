import React, { useState, useRef, useEffect } from "react";
import "./AIAssistant.css";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your LifeLink AI Health Assistant 🤖. How can I help you with blood donation rules, emergency requests, or finding nearby hospitals today?",
      time: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const sampleQuestions = [
    "Where can I donate blood?",
    "What blood groups can donate to A+?",
    "Where is the nearest hospital?",
    "When can I donate blood again?",
    "How do I request emergency blood?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");

    // Generate intelligent AI response
    setTimeout(() => {
      let replyText = "I am processing your query across the LifeLink medical database. ";
      const q = query.toLowerCase();

      if (q.includes("where can i donate") || q.includes("donate blood")) {
        replyText = "You can donate blood at any registered regional blood bank or partner hospital! In Chennai, Central Blood Bank at Greams Road and Apollo Hospital are open 24/7. Use our 'Find Donors' or 'Hospitals' tab to view operating hours.";
      } else if (q.includes("donate to a+") || q.includes("compatibility") || q.includes("a+")) {
        replyText = "Blood group A+ can receive blood from A+, A-, O+, and O- donors. A+ individuals can donate to A+ and AB+ recipients.";
      } else if (q.includes("nearest hospital") || q.includes("hospital")) {
        replyText = "The nearest partner hospitals in your network are Apollo Hospital (Greams Lane, 2.5 km away) and City Hospital (Indiranagar). Check the 'Hospitals' module for 24/7 emergency numbers and ambulance availability.";
      } else if (q.includes("again") || q.includes("interval") || q.includes("frequency")) {
        replyText = "Whole blood donation requires a minimum interval of 56 days (8 weeks) for men and 12 weeks for women. Check your eligibility countdown on your Dashboard hero profile!";
      } else if (q.includes("emergency") || q.includes("request emergency")) {
        replyText = "To request emergency blood instantly, click the 🚨 Emergency SOS button on the top right or open the 'Emergency Request' sidebar tab. Fill out the patient details and your SOS will be broadcasted to all nearby verified donors.";
      } else {
        replyText = `Regarding "${query}": LifeLink verifies donor compatibility, active hospital blood stocks, and 24/7 SOS dispatch. Please consult the 'Emergency Request' tab for critical patient assistance or visit your nearest medical facility.`;
      }

      const aiReply = {
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <div className="chat-page-container">
      <div className="chat-card">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-avatar">🤖</div>
          <div>
            <h2>LifeLink AI Assistant</h2>
            <p className="status-online">🟢 Online • Healthcare AI Advisor</p>
          </div>
        </div>

        {/* Quick Sample Questions Bar */}
        <div className="sample-questions-bar">
          <span className="sample-label">Suggested Questions:</span>
          <div className="sample-pills">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                className="sample-pill-btn"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="chat-messages-body">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble-wrapper ${msg.sender === "user" ? "user-bubble-wrapper" : "ai-bubble-wrapper"}`}
            >
              {msg.sender === "ai" && <div className="bubble-icon">🤖</div>}
              <div className={`chat-bubble ${msg.sender === "user" ? "bubble-user" : "bubble-ai"}`}>
                <p className="bubble-text">{msg.text}</p>
                <span className="bubble-time">{msg.time}</span>
              </div>
              {msg.sender === "user" && <div className="bubble-icon user-icon">👤</div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="chat-input-field"
            placeholder="Ask AI about blood compatibility, donation rules, hospitals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            Send 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
