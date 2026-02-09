# Render.com'ga Deploy Qilish

Bu qo'llanma ShopUz loyihasini Render.com'ga deploy qilish jarayonini tushuntiradi.

## 1. Render.com'da Akkaunt Yaratish

1. [Render.com](https://render.com) saytiga kiring
2. GitHub akkauntingiz bilan ro'yxatdan o'ting
3. GitHub repositoriyangizni ulang

## 2. PostgreSQL Database Yaratish

1. Render dashboard'da **New +** tugmasini bosing
2. **PostgreSQL** tanlang
3. Quyidagi ma'lumotlarni kiriting:
   - **Name**: `shopuz-db`
   - **Database**: `shopuz`
   - **User**: `shopuz`
   - **Region**: Oregon (yoki yaqin region)
   - **Plan**: Free
4. **Create Database** tugmasini bosing
5. Database yaratilgandan keyin **Internal Database URL** ni nusxalang

## 3. Backend Service Deploy Qilish

1. Render dashboard'da **New +** > **Web Service** tanlang
2. GitHub repositoriyangizni tanlang: `Davlatbek1717/ShopUz`
3. Quyidagi sozlamalarni kiriting:

### Basic Settings
- **Name**: `shopuz-backend`
- **Region**: Oregon (yoki database bilan bir xil region)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: 
  ```bash
  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### Environment Variables
**Advanced** > **Add Environment Variable** tugmasini bosing va quyidagilarni qo'shing:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | *PostgreSQL Internal Database URL* |
| `JWT_SECRET` | *Random 32+ character string* |
| `JWT_REFRESH_SECRET` | *Random 32+ character string* |
| `CORS_ORIGIN` | `https://shopuz-frontend.onrender.com` (keyinroq yangilanadi) |

**JWT Secret yaratish:**
```bash
# Terminal'da ishga tushiring
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Create Web Service** tugmasini bosing
5. Deploy jarayoni 5-10 daqiqa davom etadi
6. Deploy tugagach, backend URL'ni nusxalang (masalan: `https://shopuz-backend.onrender.com`)

## 4. Frontend Service Deploy Qilish

1. Render dashboard'da **New +** > **Web Service** tanlang
2. GitHub repositoriyangizni tanlang: `Davlatbek1717/ShopUz`
3. Quyidagi sozlamalarni kiriting:

### Basic Settings
- **Name**: `shopuz-frontend`
- **Region**: Oregon (yoki backend bilan bir xil region)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Runtime**: Node
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### Environment Variables
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | *Backend URL* (masalan: `https://shopuz-backend.onrender.com`) |

4. **Create Web Service** tugmasini bosing
5. Deploy jarayoni 5-10 daqiqa davom etadi

## 5. CORS Sozlamalarini Yangilash

Frontend deploy tugagach:

1. Backend service'ga o'ting
2. **Environment** bo'limiga o'ting
3. `CORS_ORIGIN` qiymatini frontend URL'ga o'zgartiring:
   ```
   https://shopuz-frontend.onrender.com
   ```
4. **Save Changes** tugmasini bosing
5. Backend avtomatik qayta deploy bo'ladi

## 6. Database Seed (Ixtiyoriy)

Agar demo ma'lumotlar kerak bo'lsa:

1. Backend service'da **Shell** tugmasini bosing
2. Quyidagi buyruqni ishga tushiring:
   ```bash
   npm run db:seed
   ```

## 7. Tekshirish

1. Frontend URL'ni brauzerda oching
2. Login sahifasiga o'ting
3. Demo akkauntlar bilan kirish:
   - **Admin**: admin@ecommerce.com / admin123
   - **User**: user@test.com / user123

## Muhim Eslatmalar

### Free Plan Cheklashlari
- **Database**: 1GB storage, 97 soatlik uptime/oy
- **Web Services**: 750 soatlik uptime/oy har bir service uchun
- **Inactivity**: 15 daqiqa faoliyatsizlikdan keyin service uxlaydi
- **Cold Start**: Uxlagan service'ni uyg'otish 30-60 soniya oladi

### Production Optimizatsiyalari

1. **Environment Variables**: Hech qachon secret'larni kodga qo'shmang
2. **Database Backups**: Render'da avtomatik backup mavjud
3. **Monitoring**: Render dashboard'da logs va metrics ko'ring
4. **Custom Domain**: Render'da custom domain qo'shish mumkin

### Xatoliklarni Tuzatish

**Build Failed:**
- Logs'ni tekshiring
- Dependencies to'g'ri o'rnatilganini tekshiring
- Build command to'g'ri ekanini tekshiring

**Database Connection Error:**
- `DATABASE_URL` to'g'ri ekanini tekshiring
- Database service ishlab turganini tekshiring
- Migrations to'g'ri ishlaganini tekshiring

**CORS Error:**
- `CORS_ORIGIN` frontend URL'ga to'g'ri sozlanganini tekshiring
- Backend qayta deploy bo'lganini tekshiring

## Qo'shimcha Resurslar

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

## Yangilanishlar

Kod o'zgartirilganda:

1. GitHub'ga push qiling:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```

2. Render avtomatik deploy qiladi (Auto-Deploy yoqilgan bo'lsa)
3. Yoki manual deploy qilish: Service > **Manual Deploy** > **Deploy latest commit**

---

Muvaffaqiyatli deploy! 🚀
