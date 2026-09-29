# AstroGifts — Full-Stack E-Commerce Platform

A modern, responsive full-stack e-commerce application built with **React.js, PHP Laravel 11, and MongoDB**. **AstroGifts** provides an immersive online shopping experience featuring dynamic product variant selection, real-time color image previews, cart & wishlist management, pincode delivery estimation, Razorpay payment gateway integration, Shiprocket shipping automation, and an interactive admin dashboard.

---

## 🚀 Key Features

- **Dynamic Product Variants:** Real-time color variant switching and dynamic image previewing.
- **Mobile-First Responsive Design:** Custom header with inline vertical accordion navigation drawers and admin mobile slide-out menu.
- **Pincode Delivery Estimator:** Instant pincode check and estimated delivery calculation via Shiprocket API.
- **Authentication & Access Control:** Role-Based Access Control (RBAC) with Laravel Sanctum tokens for Customers and Administrators.
- **Admin Management Panel:** Full CRUD management for products, categories, subcategories, variants, orders, and fulfillment.
- **Global Cart & Wishlist State:** Persistent client-side shopping cart and wishlist powered by React Context API and LocalStorage.
- **Automated Order Emails:** Custom HTML email invoices sent via Laravel Mailables.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Vanilla CSS3 (Custom Luxury Cream & Coffee Brown Design System)
- **Icons & Assets:** Custom SVG Icon library
- **State Management:** React Context API
- **Routing:** React Router v6

### Backend
- **Framework:** PHP Laravel 11
- **Database:** MongoDB
- **Authentication:** Laravel Sanctum
- **Integrations:** Razorpay Payment Gateway & Shiprocket Shipping API
- **API Architecture:** RESTful APIs

---

## 📁 Repository Structure

```
AstroGifts/
├── frontend/             # React.js (Vite) Frontend Application
│   ├── src/
│   │   ├── assets/       # Icons, Images, SVGs
│   │   ├── components/   # UI Layout, Home, Shop & Modal components
│   │   ├── context/      # Auth, Cart, Wishlist Contexts
│   │   ├── pages/        # Route views (Home, Category, ProductDetail, Admin)
│   │   └── services/     # Axios API integrations
│   └── package.json
└── backend/              # PHP Laravel 11 REST API Server
    ├── app/              # Controllers, Models, Mailables, Services
    ├── config/           # Database, Auth, Mail Configurations
    ├── routes/           # API routes (api.php)
    └── composer.json
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ShreyaMall/AstroGifts.git
cd AstroGifts
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
composer install
php artisan serve
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
