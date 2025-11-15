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
  - Filter by date, hostel, and status
- **Complaint Management**
  - View and respond to student complaints
- **Dashboard Analytics**
  - Real-time statistics
  - Share reports

### 🤖 Smart Chatbot
- **Voice Support**: Speech recognition and text-to-speech
- **Hostel Information**: Fees, timing, capacity, and policies
- **Smart Responses**: Context-aware answers to common questions


### Frontend
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **Lucide React** - Icon library
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
### Prerequisites
- Node.js (v16 or higher)
   ```bash
   git clone https://github.com/sakshijadhav2005/Hostel_Leave_Management.git
2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```


3. **Start the application**
   
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
- **Available Hostels**: H1, H2, H3, H4, H5
- **Annual Fees**: ₹46,000
- **Long Leave**: Multi-day, requires admin approval
- **Submission Window**: 6:00 AM - 9:00 PM only





## 📞 Support

For support, email sakshijadhav2005@example.com or create an issue in the repository.

---

**Made with ❤️ for better hostel management**

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
