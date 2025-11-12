# 🏨 Hostel Management System

A comprehensive web-based hostel management system built with React.js and Node.js, designed to streamline hostel operations including leave management, complaints, and administrative tasks.

## ✨ Features

### 👨‍🎓 Student Features
- **Leave Management**
  - Apply for short leave (same-day out/in)
  - Apply for long leave (multi-day with approval)
  - View leave history and status
- **Complaint System**
  - Submit complaints with detailed descriptions
  - Track complaint status and responses
- **Interactive Chatbot**
  - Get step-by-step guidance for forms
  - Voice input and speech output support
  - Hostel information and FAQs

### 👨‍💼 Admin/Rector Features
- **Leave Management**
  - View all leave applications
  - Approve/reject long leave requests
  - Mark students as returned from short leave
  - Filter by date, hostel, and status
- **Complaint Management**
  - View and respond to student complaints
  - Track complaint resolution
- **Dashboard Analytics**
  - Real-time statistics
  - Export data to PDF
  - Share reports

### 🤖 Smart Chatbot
- **Form Guidance**: Step-by-step instructions for all forms
- **Voice Support**: Speech recognition and text-to-speech
- **Hostel Information**: Fees, timing, capacity, and policies
- **Smart Responses**: Context-aware answers to common questions

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **Lucide React** - Icon library
- **React Query** - Data fetching and caching
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sakshijadhav2005/Hostel_Leave_Management.git
   cd Hostel_Leave_Management
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hostel_management
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the application**
   
   **Development mode:**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   # Build client
   cd client
   npm run build
   
   # Start server
   cd ../server
   npm start
   ```

## 📱 Usage

### For Students
1. **Register/Login** with your hostel credentials
2. **Apply for Leave**: Use the dashboard to submit leave applications
3. **File Complaints**: Report issues through the complaint system
4. **Use Chatbot**: Get instant help with forms and hostel information

### For Admins/Rectors
1. **Login** with admin credentials
2. **Manage Leaves**: Review and approve/reject applications
3. **Handle Complaints**: Respond to student issues
4. **Generate Reports**: Export data and analytics

### Chatbot Commands
- "Steps to fill short leave form"
- "Steps to fill long leave form"
- "Steps to fill complaint form"
- "Hostel fees"
- "Hostel timing"
- "Number of hostels"

## 🏗️ Project Structure

```
hostel-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── lib/           # Utilities and API
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── index.js          # Server entry point
└── README.md
```

## 🔧 Configuration

### Hostel Settings
- **Operating Hours**: 6:00 AM - 9:00 PM
- **Students per Room**: 3
- **Available Hostels**: H1, H2, H3, H4, H5
- **Annual Fees**: ₹46,000

### Leave Policies
- **Short Leave**: Same-day out/return, no approval needed
- **Long Leave**: Multi-day, requires admin approval
- **Submission Window**: 6:00 AM - 9:00 PM only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sakshi Jadhav** - *Initial work* - [@sakshijadhav2005](https://github.com/sakshijadhav2005)

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this system
- Inspired by the need for efficient hostel management
- Built with modern web technologies for scalability

## 📞 Support

For support, email sakshijadhav2005@example.com or create an issue in the repository.

---

**Made with ❤️ for better hostel management**

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
