# 🎓 Rootx Coaching Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-18.x+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)

**A comprehensive, modern coaching center management platform built with cutting-edge technologies**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Features Deep Dive](#-features-deep-dive)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Rootx Coaching Management System** is a full-stack web application designed to streamline and automate the operations of coaching centers, educational institutions, and training academies. Built with modern technologies and best practices, it provides an intuitive, responsive, and feature-rich platform for managing students, admissions, fees, batches, attendance, assessments, and more.

### 🎯 Why Rootx?

- **All-in-One Solution**: Manage every aspect of your coaching center from a single platform
- **Modern UI/UX**: Beautiful, responsive design that works seamlessly on all devices
- **Real-time Updates**: Instant data synchronization with React Query
- **Scalable Architecture**: Built to grow with your institution
- **Data-Driven Insights**: Advanced analytics and reporting features
- **Secure & Reliable**: Firebase authentication and secure API endpoints

---

## ✨ Key Features

### 🎓 Student Management
- **Comprehensive Student Profiles**: Store detailed student information including personal details, contact info, batch assignments, and academic history
- **Student Registration**: Streamlined onboarding process with image upload (Cloudinary integration)
- **Advanced Search & Filtering**: Find students quickly by name, email, phone, batch, status, or gender
- **Bulk Actions**: Export student data to Excel, batch operations
- **Student Lifecycle Management**: Track students from admission to enrollment
- **Cascading Delete**: Automatically removes associated records (fees, results) when deleting a student

### 📝 Admission & Enrollment
- **Lead Management**: Track prospective students from inquiry to enrollment
- **Status Workflow**: Manage admission pipeline (Inquiry → Follow-up → Enrolled/Rejected)
- **Follow-up Tracking**: Record and view complete follow-up history with notes and dates
- **Quick Status Updates**: One-click status changes with visual feedback
- **Smart Notifications**: Success/error notifications for all operations
- **Batch Assignment**: Link interested students to specific batches

### 👥 Batch & Class Management
- **Batch Creation**: Set up batches with course details, schedules, capacity, and fees
- **Instructor Assignment**: Assign teachers to batches
- **Batch Status Management**: Active/Completed/Upcoming batch tracking
- **Student Enrollment**: Track enrolled students per batch
- **Capacity Management**: Monitor and manage batch size limits
- **Schedule Organization**: Time management and class scheduling

### 💰 Fee & Finance Management
- **Flexible Fee Structure**: Configure custom fee structures for different courses/batches
- **Payment Tracking**: Record payments with multiple payment methods (Cash, Bank Transfer, Mobile Banking)
- **Due Management**: Track pending payments with due date monitoring
- **Payment History**: Complete transaction history for each student
- **Financial Reports**: Revenue tracking, payment analytics, due reports
- **Multi-installment Support**: Manage partial payments and installments
- **Export to Excel**: Generate financial reports for accounting

### 📊 Performance & Assessment Tracking
- **Exam Management**: Create and manage exams with detailed parameters
- **Result Recording**: Store exam results with marks and grades
- **Performance Analytics**: Track individual and batch performance
- **Grade Calculation**: Automated grading based on marks
- **Result History**: Complete academic record for each student
- **Performance Trends**: Visual charts and graphs using Recharts

### 📅 Attendance Management
- **Daily Attendance**: Quick and easy attendance marking
- **Attendance Reports**: Generate reports by date, batch, or student
- **Attendance Analytics**: Track attendance patterns and trends
- **Bulk Attendance**: Mark attendance for entire batches
- **Absence Tracking**: Monitor student attendance issues
- **Export Capabilities**: Download attendance reports

### 📈 Advanced Analytics & Reporting
- **Dashboard Overview**: Key metrics and statistics at a glance
- **Revenue Analytics**: Financial performance tracking with charts
- **Student Analytics**: Enrollment trends, batch distribution
- **Performance Metrics**: Overall academic performance tracking
- **Custom Reports**: Generate detailed reports for various parameters
- **Data Visualization**: Interactive charts powered by Recharts

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user authentication
- **Role-based Access**: Admin and staff role management
- **Protected Routes**: Secure API endpoints and pages
- **Session Management**: Persistent login sessions
- **Password Security**: Encrypted credentials

### 🎨 User Interface & Experience
- **Modern Design**: Clean, professional interface with DaisyUI components
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Multiple theme options (25+ DaisyUI themes)
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: User-friendly error messages and notifications
- **Intuitive Navigation**: Easy-to-use sidebar with organized sections
- **Confirmation Modals**: Prevent accidental data deletion
- **Toast Notifications**: Real-time feedback for user actions

### 🔄 Data Management
- **React Query Integration**: Efficient data fetching and caching
- **Optimistic Updates**: Instant UI updates with background sync
- **Cache Invalidation**: Smart cache management for data consistency
- **Pagination**: Efficient handling of large datasets
- **Sorting & Filtering**: Powerful table operations with TanStack Table
- **Search Functionality**: Global and column-specific search

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.11.0
- **State Management**: React Query (TanStack Query) 5.90.12
- **Form Management**: React Hook Form 7.68.0
- **UI Framework**: Tailwind CSS 4.1.18
- **Component Library**: DaisyUI 5.5.14
- **Icons**: React Icons 5.5.0
- **Tables**: TanStack Table 8.21.3
- **Charts**: Recharts 3.6.0
- **Date Picker**: React DatePicker 9.1.0
- **Excel Export**: XLSX 0.18.5
- **Authentication**: Firebase 12.7.0
- **HTTP Client**: Axios 1.13.2

### Backend
- **Runtime**: Node.js 18.x+
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB 7.0
- **ODM**: MongoDB Native Driver
- **Authentication**: Firebase Admin SDK
- **CORS**: cors 2.8.5
- **Environment**: dotenv 17.2.3

### Cloud Services
- **Authentication**: Firebase Auth
- **Image Storage**: Cloudinary
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Backend), Firebase Hosting (Frontend)

### Development Tools
- **Code Quality**: ESLint 9.39.1
- **Version Control**: Git
- **Package Manager**: npm

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Pages    │  │ Components │  │   Contexts/Hooks     │  │
│  │            │  │            │  │                      │  │
│  │ • Students │  │ • Loader   │  │ • AuthContext        │  │
│  │ • Batches  │  │ • Logo     │  │ • NotificationCtx    │  │
│  │ • Fees     │  │ • Modals   │  │ • useAxiosSecure     │  │
│  │ • Results  │  │            │  │ • useAuth            │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React Query (Data Management)                │  │
│  │  • Caching  • Mutations  • Auto-refetch              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Axios + Firebase Auth
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │    API     │  │ Middleware │  │   Database Layer     │  │
│  │  Routes    │  │            │  │                      │  │
│  │            │  │ • CORS     │  │ • Connection Pool    │  │
│  │ • /users   │  │ • Auth     │  │ • Collections        │  │
│  │ • /students│  │ • Error    │  │ • Queries            │  │
│  │ • /batches │  │            │  │                      │  │
│  │ • /fees    │  │            │  │                      │  │
│  │ • /results │  │            │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │Collections │  │  Indexes   │  │    Replication       │  │
│  │            │  │            │  │                      │  │
│  │ • users    │  │ • Compound │  │ • High Availability  │  │
│  │ • students │  │ • Single   │  │ • Automatic Backup   │  │
│  │ • batches  │  │            │  │                      │  │
│  │ • fees     │  │            │  │                      │  │
│  │ • results  │  │            │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
- **Firebase Account** - [Sign Up](https://firebase.google.com/)
- **Cloudinary Account** - [Sign Up](https://cloudinary.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rootx-coaching-management-system.git
cd rootx-coaching-management-system
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd rootx_coaching_management_server_side

# Install dependencies
npm install

# Create .env file
touch .env
```

Add the following to `.env`:

```env
# MongoDB Configuration
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password

# Server Configuration
PORT=3001
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

Server will run at `http://localhost:3001`

#### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd rootx_coaching_management_client_side

# Install dependencies
npm install

# Create .env file
touch .env.local
```

Add the following to `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

#### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 📁 Project Structure

```
Rootx-Coaching-Management-System/
│
├── rootx_coaching_management_client_side/     # Frontend React Application
│   ├── public/                                # Static assets
│   ├── src/
│   │   ├── assets/                           # Images, icons
│   │   ├── components/                       # Reusable components
│   │   │   ├── Loader.jsx                   # Loading component
│   │   │   ├── Logo.jsx                     # Logo component
│   │   │   └── Notification.jsx             # Toast notifications
│   │   ├── contexts/                         # React contexts
│   │   │   ├── auth/                        # Authentication context
│   │   │   └── NotificationContext.jsx      # Notification context
│   │   ├── firebase/                         # Firebase configuration
│   │   ├── hooks/                            # Custom React hooks
│   │   │   ├── useAuth.jsx                  # Auth hook
│   │   │   └── useAxiosSecure.jsx           # Axios with auth
│   │   ├── layouts/                          # Layout components
│   │   │   ├── AuthLayout.jsx               # Auth pages layout
│   │   │   └── DashboardLayout.jsx          # Main app layout
│   │   ├── pages/                            # Application pages
│   │   │   ├── Admission&Enrollment/        # Admission management
│   │   │   │   ├── Admissions.jsx          # Admissions list
│   │   │   │   ├── AdmissionForm.jsx       # New admission form
│   │   │   │   └── AdmissionManagement.jsx # Root component
│   │   │   ├── AttendenceManagement/        # Attendance tracking
│   │   │   │   ├── Attendence.jsx
│   │   │   │   └── AttendenceManagement.jsx
│   │   │   ├── Auth/                         # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   └── SignUp.jsx
│   │   │   ├── Batch&ClassManagement/       # Batch management
│   │   │   │   ├── Batches.jsx
│   │   │   │   └── BatchManagement.jsx
│   │   │   ├── Fee&FinanceManagement/       # Finance module
│   │   │   │   ├── Finances.jsx            # Financial overview
│   │   │   │   ├── FeeCollection.jsx       # Collect payments
│   │   │   │   ├── FeeManagement.jsx       # Root component
│   │   │   │   ├── FeeStructure.jsx        # Fee configuration
│   │   │   │   └── TransectionHistory.jsx  # Payment history
│   │   │   ├── Performance&AssessmentTracking/  # Results module
│   │   │   │   ├── AddResult.jsx
│   │   │   │   ├── ExamSchedule.jsx
│   │   │   │   └── Results.jsx
│   │   │   ├── StudentManagement/           # Student module
│   │   │   │   ├── AddStudent.jsx
│   │   │   │   ├── StudentManagement.jsx
│   │   │   │   ├── Students.jsx
│   │   │   │   └── StudentProfile.jsx
│   │   │   ├── ErrorPage.jsx                # 404 page
│   │   │   └── Overview.jsx                 # Dashboard home
│   │   ├── App.jsx                           # Main app component
│   │   ├── main.jsx                          # Entry point
│   │   ├── router.jsx                        # Route configuration
│   │   └── index.css                         # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── rootx_coaching_management_server_side/     # Backend Express Application
│   ├── index.js                              # Server entry point
│   ├── package.json
│   ├── vercel.json                           # Vercel deployment config
│   └── README.md
│
├── doc/                                       # Documentation
│   ├── Rootx Coaching Management System.pdf
│   └── Database Schema.pdf
│
└── README.md                                  # This file
```

---

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-api-domain.vercel.app`

### Authentication
All protected endpoints require Firebase Authentication token in headers:
```
Authorization: Bearer <firebase_token>
```

### Core Endpoints

#### 🏥 Health Check
```http
GET /health
```
Returns server health status.

#### 👤 Users
```http
POST   /users              # Create new user
GET    /users              # Get all users
GET    /users/:email       # Get user by email
```

#### 🎓 Students
```http
POST   /students           # Create new student
GET    /students           # Get all students
GET    /students/:id       # Get student by ID
PATCH  /students/:id       # Update student
DELETE /students/:id       # Delete student (cascades to fees & results)
```

Query Parameters:
- `?batchId=xxx` - Filter by batch
- `?status=active` - Filter by status

#### 📝 Admissions
```http
POST   /admissions         # Create admission inquiry
GET    /admissions         # Get all admissions
GET    /admissions/:id     # Get admission by ID
PATCH  /admissions/:id     # Update admission (status, follow-ups)
DELETE /admissions/:id     # Delete admission
```

Request Body (PATCH):
```json
{
  "status": "enrolled",
  "followUpNote": "Called the student",
  "followUpDate": "2026-01-10T00:00:00.000Z"
}
```

#### 👥 Batches
```http
POST   /batches            # Create new batch
GET    /batches            # Get all batches
GET    /batches/:id        # Get batch by ID
PATCH  /batches/:id        # Update batch
DELETE /batches/:id        # Delete batch
```

Query Parameters:
- `?status=active` - Get active batches
- `?status=completed` - Get completed batches

#### 💰 Fees
```http
POST   /fees               # Create fee record
GET    /fees               # Get all fees
GET    /fees/:id           # Get fee by ID
PATCH  /fees/:id           # Add payment
DELETE /fees/:id           # Delete fee record
```

Query Parameters:
- `?studentId=xxx` - Get fees for specific student
- `?status=due` - Get dues
- `?status=clear` - Get cleared payments

Request Body (POST):
```json
{
  "studentId": "abc123",
  "batchId": "batch123",
  "totalAmount": 5000,
  "paidAmount": 2000,
  "dueAmount": 3000,
  "paymentMethod": "Cash",
  "dueDate": "2026-02-01",
  "status": "due"
}
```

#### 📊 Results
```http
POST   /results            # Add exam result
GET    /results            # Get all results
GET    /results/:id        # Get result by ID
PATCH  /results/:id        # Update result
DELETE /results/:id        # Delete result
```

Query Parameters:
- `?studentId=xxx` - Get results for specific student
- `?batchId=xxx` - Get results for batch
- `?examId=xxx` - Get results for exam

#### 📅 Attendance
```http
POST   /attendance         # Mark attendance
GET    /attendance         # Get attendance records
GET    /attendance/:id     # Get attendance by ID
```

Query Parameters:
- `?studentId=xxx` - Get attendance for student
- `?batchId=xxx` - Get attendance for batch
- `?date=2026-01-09` - Get attendance for date

---

## 🎯 Features Deep Dive

### Student Management System

The student management module is the core of the application, providing comprehensive tools to manage student data throughout their lifecycle.

**Key Capabilities:**
- **Detailed Profiles**: Store personal information, contact details, guardian info, admission date, batch assignment, and status
- **Image Upload**: Cloudinary integration for student photos
- **Advanced Filtering**: Multi-criteria filtering (batch, status, gender)
- **Search Functionality**: Global search across name, email, and phone
- **Data Export**: Export student lists to Excel
- **Edit & Update**: In-line editing with modal forms
- **Cascading Operations**: Automatic cleanup of related data on deletion
- **Responsive Tables**: Desktop and mobile-optimized views

**Technical Implementation:**
- TanStack Table for powerful data grid operations
- React Hook Form for form validation
- React Query for efficient data fetching and caching
- Optimistic updates for instant UI feedback

### Admission Pipeline

Streamline the admission process from initial inquiry to final enrollment with a complete CRM-like system.

**Workflow Stages:**
1. **Inquiry**: Initial contact from prospective students
2. **Follow-up**: Track communication history with notes and dates
3. **Enrolled**: Successfully enrolled students
4. **Rejected**: Declined applications

**Features:**
- **Follow-up Management**: Record multiple follow-ups with timestamps and notes
- **Status Tracking**: Visual status badges with color coding
- **Quick Actions**: One-click status changes (enrolled/rejected)
- **History View**: Complete interaction history in modal
- **Batch Interest**: Link prospects to target batches
- **Smart Notifications**: Real-time feedback for all operations

**Technical Features:**
- Modal-based follow-up history viewer
- Batch status updates with React Query mutations
- Responsive mobile accordion views
- Icon-based visual indicators

### Fee & Finance Management

Complete financial management system with payment tracking, due management, and reporting.

**Core Features:**
- **Fee Structure Management**: Configure course-wise fee structures
- **Payment Collection**: Record payments with multiple methods
- **Installment Support**: Handle partial payments
- **Due Tracking**: Monitor pending payments with due dates
- **Payment History**: Complete transaction log
- **Financial Reports**: Revenue analytics and due reports
- **Export Options**: Generate Excel reports

**Payment Methods Supported:**
- Cash
- Bank Transfer
- Mobile Banking (bKash, Nagad, Rocket)
- Check
- Card Payment

**Reports Available:**
- Total Revenue
- Pending Dues
- Payment History by Student
- Batch-wise Collection
- Date Range Reports

### Batch & Class Management

Organize courses into batches with instructor assignments, schedules, and capacity management.

**Features:**
- **Batch Creation**: Set up with course details, schedule, fees
- **Capacity Management**: Track enrollments vs. capacity
- **Status Tracking**: Active/Completed/Upcoming
- **Instructor Assignment**: Link teachers to batches
- **Student Enrollment**: View and manage enrolled students
- **Schedule Management**: Class timings and days

**Batch Information:**
- Course Name
- Batch Name
- Start & End Dates
- Class Schedule (days & time)
- Fee Structure
- Instructor Details
- Maximum Capacity
- Current Enrollment

### Performance Tracking

Track student academic performance with exam management and result recording.

**Features:**
- **Exam Creation**: Set up exams with full details
- **Result Entry**: Record marks and generate grades
- **Performance Analytics**: Charts and graphs
- **Result History**: Complete academic record
- **Grade Calculation**: Automated grading system
- **Performance Trends**: Visual analytics with Recharts

**Exam Details:**
- Exam Name
- Exam Date
- Total Marks
- Passing Marks
- Subject/Topic
- Batch Assignment

**Result Tracking:**
- Marks Obtained
- Grade (A+, A, B, C, D, F)
- Percentage
- Rank (optional)
- Remarks

### Attendance System

Efficient attendance marking and tracking with comprehensive reporting.

**Features:**
- **Daily Marking**: Quick attendance entry
- **Batch-wise View**: Mark entire batch attendance
- **Attendance Reports**: By student, batch, or date range
- **Absence Tracking**: Monitor attendance patterns
- **Analytics**: Attendance percentage and trends
- **Export**: Download attendance reports

### Analytics Dashboard

Get insights into your coaching center's operations with powerful analytics.

**Metrics Tracked:**
- Total Students (Active/Inactive)
- Total Revenue & Pending Dues
- Batch Enrollment Statistics
- Admission Pipeline (Inquiry/Follow-up/Enrolled)
- Attendance Trends
- Performance Averages
- Revenue Trends (Monthly/Quarterly)

**Visualization:**
- Line Charts: Revenue trends
- Bar Charts: Batch-wise enrollment
- Pie Charts: Status distribution
- Area Charts: Attendance patterns

---

## 🚀 Deployment

### Frontend Deployment (Firebase Hosting)

#### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created

#### Steps

1. **Login to Firebase**
```bash
firebase login
```

2. **Initialize Firebase**
```bash
cd rootx_coaching_management_client_side
firebase init hosting
```

Select:
- Use existing project
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deploys: `No` (optional)

3. **Build the Project**
```bash
npm run build
```

4. **Deploy**
```bash
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

### Backend Deployment (Vercel)

#### Prerequisites
- Vercel account
- Vercel CLI installed: `npm install -g vercel`

#### Steps

1. **Login to Vercel**
```bash
vercel login
```

2. **Deploy**
```bash
cd rootx_coaching_management_server_side
vercel
```

3. **Add Environment Variables**

In Vercel Dashboard:
- Go to your project
- Settings → Environment Variables
- Add:
  - `DB_USER`
  - `DB_PASS`
  - `NODE_ENV=production`

4. **Deploy to Production**
```bash
vercel --prod
```

Your API will be live at: `https://your-project-name.vercel.app`

#### Update Frontend API URL

Update `.env.local` in frontend:
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app
```

Rebuild and redeploy frontend.

### MongoDB Atlas Configuration

Ensure your MongoDB Atlas cluster allows connections:
1. Go to Network Access
2. Add IP: `0.0.0.0/0` (for Vercel)
3. Or add specific Vercel IPs

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](doc/screenshots/dashboard.png)
*Main dashboard with key metrics and analytics*

### Student Management
![Students](doc/screenshots/students.png)
*Comprehensive student list with filtering and search*

### Admission Pipeline
![Admissions](doc/screenshots/admissions.png)
*Admission management with follow-up tracking*

### Fee Management
![Fees](doc/screenshots/fees.png)
*Financial management and payment tracking*

### Batch Management
![Batches](doc/screenshots/batches.png)
*Batch creation and management interface*

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 🐛 Known Issues & Roadmap

### Known Issues
- [ ] Excel export may be slow for large datasets (>1000 records)
- [ ] Mobile view optimization needed for complex tables

### Future Enhancements
- [ ] SMS/Email notifications
- [ ] Parent portal
- [ ] Online exam module
- [ ] Video lecture integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting with PDF export
- [ ] Integration with accounting software
- [ ] Automated payment reminders
- [ ] AI-powered student performance predictions

---

## 📞 Support

For support, issues, or feature requests:
- 📧 Email: support@rootxcoaching.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/rootx-coaching-management-system/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/rootx-coaching-management-system/wiki)

---

## 👥 Team

- **Project Lead**: Your Name
- **Backend Developer**: Your Name
- **Frontend Developer**: Your Name
- **UI/UX Designer**: Your Name

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [DaisyUI](https://daisyui.com/) - Component Library
- [TanStack Query](https://tanstack.com/query) - Data Fetching
- [TanStack Table](https://tanstack.com/table) - Table Library
- [Firebase](https://firebase.google.com/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment
- [Cloudinary](https://cloudinary.com/) - Image Storage
- [Recharts](https://recharts.org/) - Charts Library

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ by Rootx Team**

[Back to Top](#-rootx-coaching-management-system)

</div>
