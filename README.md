# ShopUz - E-Commerce Platform

Modern va professional e-commerce platformasi Next.js, Express.js va Prisma bilan qurilgan.

## 🚀 Texnologiyalar

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **Express.js** - Node.js framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **SQLite** - Development database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Xususiyatlar

### Foydalanuvchi uchun
- ✅ Mahsulotlarni ko'rish va qidirish
- ✅ Savatcha boshqaruvi
- ✅ Buyurtma berish
- ✅ Profil boshqaruvi
- ✅ Buyurtmalar tarixi
- ✅ Chegirmalar va aksiyalar

### Admin uchun
- ✅ Mahsulotlarni boshqarish (CRUD)
- ✅ Buyurtmalarni boshqarish
- ✅ Foydalanuvchilarni ko'rish
- ✅ Statistika va hisobotlar

### Xavfsizlik
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Input validation
- ✅ CSRF protection
- ✅ Security headers

## 🛠️ O'rnatish

### Talablar
- Node.js 18+
- npm yoki yarn
- PostgreSQL (production uchun)

### 1. Repositoriyani klonlash
```bash
git clone https://github.com/Davlatbek1717/ShopUz.git
cd ShopUz
```

### 2. Dependencies o'rnatish
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 3. Environment variables sozlash
```bash
# Root .env
cp .env.example .env

# Frontend .env.local
cp frontend/.env.local.example frontend/.env.local

# Backend .env
cp backend/.env.example backend/.env
# DATABASE_URL ni PostgreSQL connection string bilan almashtiring
```

### 4. Database sozlash (Development - SQLite)
```bash
cd backend

# Prisma migratsiyalarini ishga tushirish
npx prisma migrate dev

# Seed data qo'shish
npx prisma db seed
```

**Production uchun PostgreSQL:**
- `backend/prisma/schema.prisma` da datasource `postgresql` ga o'zgartirilgan
- `DATABASE_URL` environment variable'ni sozlang

### 5. Ishga tushirish

#### Development mode
```bash
# Root papkadan (ikkala serverni birga ishga tushirish)
npm run dev

# Yoki alohida:
# Frontend (port 3000)
cd frontend
npm run dev

# Backend (port 5000)
cd backend
npm run dev
```

#### Production build
```bash
# Frontend build
cd frontend
npm run build
npm start

# Backend build
cd backend
npm run build
npm start
```

## 🔑 Demo Accounts

### Admin
- **Email:** admin@ecommerce.com
- **Password:** admin123

### User
- **Email:** user@test.com
- **Password:** user123

## 📁 Loyiha Strukturasi

```
ShopUz/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── contexts/        # Context providers
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── package.json
└── package.json             # Root package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `POST /api/auth/logout` - Chiqish
- `POST /api/auth/refresh` - Token yangilash

### Products
- `GET /api/products` - Barcha mahsulotlar
- `GET /api/products/:id` - Bitta mahsulot
- `POST /api/products` - Mahsulot qo'shish (Admin)
- `PUT /api/products/:id` - Mahsulot yangilash (Admin)
- `DELETE /api/products/:id` - Mahsulot o'chirish (Admin)

### Cart
- `GET /api/cart` - Savatni olish
- `POST /api/cart` - Savatga qo'shish
- `PUT /api/cart/:id` - Savatni yangilash
- `DELETE /api/cart/:id` - Savatdan o'chirish

### Orders
- `GET /api/orders` - Buyurtmalar ro'yxati
- `GET /api/orders/:id` - Buyurtma tafsilotlari
- `POST /api/orders` - Buyurtma berish
- `PUT /api/orders/:id/status` - Status yangilash (Admin)
- `DELETE /api/orders/:id` - Buyurtmani bekor qilish

### Profile
- `GET /api/profile` - Profil ma'lumotlari
- `PUT /api/profile` - Profil yangilash
- `PUT /api/profile/password` - Parol o'zgartirish

## 🎨 Design System

Loyihada professional design system ishlatilgan:
- Custom CSS variables
- Tailwind utility classes
- Responsive design (mobile-first)
- Modern gradients va animations
- Consistent spacing va typography

## 🔒 Xavfsizlik

- JWT tokens (access + refresh)
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Rate limiting
- Input validation va sanitization
- CSRF protection
- Security headers (helmet)

## 🚀 Deployment

### Render.com'ga Deploy Qilish

Batafsil ko'rsatmalar uchun [DEPLOYMENT.md](DEPLOYMENT.md) faylini ko'ring.

**Qisqacha:**
1. PostgreSQL database yarating
2. Backend service deploy qiling
3. Frontend service deploy qiling
4. Environment variables sozlang

**Live Demo:** [ShopUz on Render](https://shopuz-frontend.onrender.com) *(deploy qilingandan keyin)*

## 📝 License

MIT License - batafsil ma'lumot uchun [LICENSE](LICENSE) faylini ko'ring.

## 👨‍💻 Muallif

**Davlatbek**
- GitHub: [@Davlatbek1717](https://github.com/Davlatbek1717)

## 🤝 Contributing

Pull requests qabul qilinadi. Katta o'zgarishlar uchun avval issue oching.

## 📞 Aloqa

Savollar yoki takliflar bo'lsa, issue oching yoki pull request yuboring.

---

⭐ Agar loyiha yoqsa, star bering!
