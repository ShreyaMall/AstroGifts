# AstroGifts — Full-Stack E-Commerce Platform

A modern, responsive full-stack e-commerce application built with React, Node.js, Express, and MongoDB. **AstroGifts** provides an immersive online shopping experience featuring dynamic product variant selection, real-time color image previews, cart & wishlist management, pincode delivery estimation, and an interactive admin dashboard.

---

## 🚀 Key Features

- **Dynamic Product Variants:** Real-time color variant switching and dynamic image previewing.
- **Mobile-First Responsive Design:** Custom header with inline vertical accordion navigation drawers for mobile views.
- **Pincode Delivery Estimator:** Instant pincode check and estimated delivery calculation.
- **Authentication & Access Control:** Role-Based Access Control (RBAC) with secure JWT tokens for Customers and Administrators.
- **Admin Management Panel:** Full CRUD management for products, categories, subcategories, variants, and order fulfillment.
- **Global Cart & Wishlist State:** Persistent client-side shopping cart and wishlist powered by React Context API.
- **Invoice & PDF Generation:** Automated order invoice PDF generation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Vanilla CSS3 (Custom Design Tokens)
- **Icons & Assets:** Custom SVG Icon library
- **State Management:** React Context API
- **Routing:** React Router v6
- **PDF Generation:** jsPDF / jsPDF-AutoTable

### Backend
- **Runtime:** Node.js / Express.js
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
- **API Architecture:** RESTful APIs

---

## 📁 Repository Structure

```
woodmart-clone/
├── frontend/             # Vite + React Frontend Application
│   ├── src/
│   │   ├── assets/       # Icons, Images, SVGs
│   │   ├── components/   # UI Layout, Home, Shop & Modal components
│   │   ├── context/      # Auth, Cart, Wishlist Contexts
│   │   ├── pages/        # Route views (Home, Category, ProductDetail, Admin)
│   │   └── services/     # Axios API integrations
│   └── package.json
└── backend/              # Node.js Express REST API Server
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ShreyaMall/Homewood-Decor.git
cd Homewood-Decor
```

### 2. Setup & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup & Run Backend
```bash
cd ../backend
npm install
npm start
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
