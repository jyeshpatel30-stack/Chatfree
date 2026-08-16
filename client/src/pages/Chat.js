import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';

let socket;

function Chat({ user, setIsAuthenticated }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Socket initialization
  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('user_online', user._id);

    socket.on('receive_message', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data.messageId,
          sender: data.sender,
          content: data.content,
          createdAt: data.timestamp,
        },
      ]);
    });

    socket.on('user_typing_indicator', (data) => {
      if (data.userId === selectedUser?._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id, selectedUser]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('यूजर्स लोड करने में त्रुटि:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('संदेश लोड करने में त्रुटि:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    try {
      const response = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        { content: messageText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const newMessage = response.data.data;
      setMessages((prev) => [...prev, newMessage]);

      // Emit via socket
      socket.emit('send_message', {
        sender: user._id,
        receiver: selectedUser._id,
        content: messageText,
        messageId: newMessage._id,
      });

      setMessageText('');
    } catch (error) {
      console.error('संदेश भेजने में त्रुटि:', error);
    }
  };

  const handleTyping = () => {
    socket.emit('user_typing', {
      userId: user._id,
      receiver: selectedUser._id,
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('लॉगआउट में त्रुटि:', error);
    }
  };

  if (loading) {
    return <div className="loading">लोड हो रहा है...</div>;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>💬 Chatfree</h1>
          <div className="user-info">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div>{user.name}</div>
              <small>{user.email}</small>
            </div>
          </div>
        </div>

        <div className="users-list">
          {users.map((u) => (
            <div
              key={u._id}
              className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="user-item-avatar">{u.name.charAt(0).toUpperCase()}</div>
              <div className="user-item-name">
                <div>{u.name}</div>
                <small>{u.email}</small>
              </div>
              <div className={`user-status ${u.status}`}></div>
            </div>
          ))}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          लॉगआउट करें
        </button>
      </div>

      <div className="chat-container">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>{selectedUser.name}</h2>
              <div className="chat-header-user">
                <span className={`user-status ${selectedUser.status}`}></span>
                <span>{selectedUser.status === 'online' ? 'ऑनलाइन' : 'ऑफलाइन'}</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  कोई संदेश नहीं। बातचीत शुरू करें! 👋
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${msg.sender._id === user._id ? 'sent' : ''}`}
                  >
                    <div className="message-avatar">
                      {msg.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString('hi-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {typing && (
                <div className="message">
                  <div className="message-avatar">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', flex: 1 }}>
                <textarea
                  className="chat-input"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyUp={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                  placeholder="अपना संदेश लिखें..."
                  rows="1"
                />
                <button type="submit" className="send-button">
                  भेजें ➤
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-user-selected">कोई यूजर चुनिए</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
