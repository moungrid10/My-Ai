# 🤖 AI Chat Application

A modern, full-stack AI chat application built with React, Node.js, and MongoDB. Features real-time conversations with AI models, user authentication, chat history, and advanced UI features.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-green)

## 🚀 Features

### Core Functionality
- **🔐 User Authentication** - JWT-based login/registration system
- **💬 Real-time AI Chat** - Conversation with multiple AI models (Ollama integration)
- **📚 Chat History** - Persistent chat sessions with MongoDB storage
- **🔄 Model Selection** - Switch between different AI models dynamically

### Advanced Features
- **🌙 Dark/Light Theme** - Toggle between themes with localStorage persistence
- **🔍 Message Search** - Real-time search through chat history
- **⭐ Message Ratings** - 5-star rating system for AI responses
- **📎 File Upload** - ChatGPT-style file attachment support
- **📄 Export Options** - Download chats as PDF or copy URLs
- **🎨 Modern UI** - Responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **jsPDF** - PDF generation for chat exports

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### AI Integration
- **Ollama** - Local AI model hosting
- **Multiple Models** - Support for Mistral and other models

## 📦 Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (local or cloud)
- Ollama (for AI models)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-chat-app.git
cd My_Ai
```

### 2. Backend Setup
```bash
cd backend
npm install


# Start the backend server
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

### 4. Install Ollama & Models
```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull AI models
ollama pull mistral
ollama pull llama2
```

## 🚀 Usage



1. **Create an Account**
   - Register with email and password
   - Login to access the chat interface

2. **Start Chatting**
   - Select an AI model from the dropdown
   - Type your message and press Enter
   - Rate AI responses with the star system

3. **Advanced Features**
   - Toggle dark/light theme with the 🌙/☀️ button
   - Search messages with the 🔍 button
   - Upload files with the + button
   - Export chats as PDF from the menu

## 📁 Project Structure

```
My_Ai/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Chat.js          # Chat schema
│   ├── index.js             # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main chat interface
│   │   ├── main.jsx         # App entry point
│   │   └── index.css        # Tailwind styles
│   ├── pages/
│   │   └── Auth.jsx         # Login/Register component
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔧 Configuration



### Ollama Models
The app supports multiple AI models. Add new models by:

1. Installing with Ollama: `ollama pull model-name`
2. The app automatically detects available models

## 🎨 Screenshots



## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables in your hosting platform
# Deploy with your preferred service
```


## 👨‍💻 Author

**Your Name**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [linkedin.com/in/yourname](https://linkedin.com/in/yourname)
- GitHub: [github.com/yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local AI model hosting
- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility classes
- [React](https://reactjs.org/) team for the excellent framework
- [MongoDB](https://mongodb.com/) for the flexible database solution

---

⭐ **Star this repository if you found it helpful!**
