# 📄 Document Signature App

A full-stack Document Signature Platform that allows users to upload PDF documents, invite signers, collect digital signatures, and maintain audit logs securely.

## 🚀 Live Demo

### Frontend
https://document-signature-app-nine-alpha.vercel.app

### Backend API
https://document-signature-app-liks.onrender.com

---

# ✨ Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes

### Document Management
- Upload PDF Documents
- Store Documents Securely
- View Uploaded Documents
- Manage Documents

### Signature Workflow
- Invite Signers
- Generate Public Signing Links
- Sign Documents Online
- Track Signature Status

### Audit Logs
- User Activity Tracking
- IP Address Logging
- Browser Information Logging
- Document Activity Monitoring

### Cloud Storage
- Cloudinary Integration
- Secure PDF Storage
- Production Ready Upload System

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod
- React Hot Toast
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- Morgan
- Helmet
- Cookie Parser

## Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
- File Storage → Cloudinary

---

# 📂 Project Structure

```bash
Document Signature App
│
├── client
│   ├── src
│   ├── public
│   ├── components
│   ├── services
│   └── app
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── uploads
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/document-signature-app.git
cd document-signature-app
```

---

# Frontend Setup

```bash
cd client
npm install
npm run dev
```

Runs on:

```txt
http://localhost:3000
```

---

# Backend Setup

```bash
cd server
npm install
npm run dev
```

Runs on:

```txt
http://localhost:5000
```

---

# 🔑 Environment Variables

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

---

## Backend (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 📦 API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Get Profile

```http
GET /api/auth/profile
```

---

## Documents

### Upload Document

```http
POST /api/docs/upload
```

### Get Documents

```http
GET /api/docs
```

### Get Single Document

```http
GET /api/docs/:id
```

---

## Signatures

### Invite Signer

```http
POST /api/signatures/invite
```

### Get Signatures

```http
GET /api/signatures/:documentId
```

### Public Signing Page

```http
GET /api/signatures/public/:token
```

---

## Audit Logs

### Get Audit Logs

```http
GET /api/audit
```

---

# 🗄 Database Collections

## Users

```js
{
  _id,
  name,
  email,
  password
}
```

## Documents

```js
{
  _id,
  title,
  fileUrl,
  uploadedBy,
  createdAt
}
```

## Signatures

```js
{
  _id,
  documentId,
  signerEmail,
  token,
  signed
}
```

## Audit Logs

```js
{
  _id,
  user,
  action,
  ipAddress,
  userAgent,
  createdAt
}
```

---

# 🧪 Testing Checklist

## Authentication

- [x] Register User
- [x] Login User
- [x] JWT Generation
- [x] Protected Routes

## Documents

- [x] Upload PDF
- [x] Store PDF in Cloudinary
- [x] Save Document in MongoDB

## Signatures

- [x] Invite Signer
- [x] Generate Public Link
- [x] Sign Document

## Audit Logs

- [x] Track User Activity
- [x] Store Audit Records

## Deployment

- [x] Frontend on Vercel
- [x] Backend on Render
- [x] MongoDB Atlas Connected
- [x] Cloudinary Integrated

---

# 📸 Screenshots

## Login Page

![alt text](image.png)

## Dashboard

![alt text](image-1.png)

## Upload Document

![alt text](image-2.png)

## Sign Document

![alt text](image-3.png)

---

# 🔒 Security Features

- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- Input Validation using Zod
- Helmet Security Headers
- CORS Protection
- Environment Variables

---

# 📈 Future Improvements

- Email Notifications
- Multiple Signers
- Signature Position Selection
- Document Expiry
- Role-Based Access Control
- PDF Preview
- Signature Verification

---

# 👨‍💻 Author

Om Zalavadiya

---

# ⭐ Acknowledgements

- Next.js
- Express.js
- MongoDB Atlas
- Cloudinary
- Tailwind CSS
- Render
- Vercel