# Chatfree - Real-time Messaging Application

एक आधुनिक, real-time messaging application जहाँ आप अपने दोस्तों से chat कर सकते हैं।

## Features ✨

- ✅ User Authentication (Sign up/Login)
- ✅ Direct Messaging (One-to-one chat)
- ✅ Group Chat
- ✅ Real-time Messages (Socket.io)
- ✅ Message History
- ✅ User Online Status
- ✅ Typing Indicator
- ✅ Message Notifications

## Tech Stack 🛠️

### Frontend
- React.js
- Socket.io Client
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB
- JWT Authentication
- bcrypt

## Project Structure 📁

```
chatfree/
├── client/              # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/              # Node.js Backend
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/      # Authentication & validation
│   ├── config/          # Configuration files
│   └── server.js        # Main server file
└── README.md
```

## Installation 🚀

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm या yarn

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# .env में अपने MongoDB URI और JWT secret add करें
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

App चलेगा: http://localhost:3000

## API Routes 📡

### Authentication
- `POST /api/auth/register` - नया user बनाएँ
- `POST /api/auth/login` - Login करें
- `GET /api/auth/profile` - Profile देखें

### Messages
- `GET /api/messages/:userId` - सभी messages
- `POST /api/messages/:userId` - Message भेजें
- `DELETE /api/messages/:messageId` - Message हटाएँ

### Users
- `GET /api/users` - सभी users list
- `GET /api/users/:userId` - User profile

## Socket Events 🔌

- `connect` - User connect करे
- `disconnect` - User disconnect करे
- `send_message` - Message भेजें
- `receive_message` - Message प्राप्त करें
- `typing` - Typing indicator
- `user_status` - Online/Offline status

## License

MIT

## Author

Jyesh Patel
