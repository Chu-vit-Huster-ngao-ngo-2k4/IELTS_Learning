# 🚀 Hướng dẫn Deploy IELTS LMS

## **Cách 1: Deploy lên Vercel (Khuyến nghị)**

### **Bước 1: Tạo repository trên GitHub**

1. Đăng nhập vào [GitHub](https://github.com)
2. Tạo repository mới với tên `ielts-lms`
3. Copy URL repository

### **Bước 2: Push code lên GitHub**

```bash
# Thêm remote origin
git remote add origin https://github.com/yourusername/ielts-lms.git

# Push code lên GitHub
git push -u origin master
```

### **Bước 3: Deploy lên Vercel**

1. Đăng nhập vào [Vercel](https://vercel.com)
2. Click "New Project"
3. Import repository từ GitHub
4. Cấu hình environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_R2_ENDPOINT`
   - `NEXT_PUBLIC_R2_BUCKET`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
5. Click "Deploy"

### **Bước 4: Cấu hình Supabase**

1. Vào Supabase Dashboard
2. Chạy các SQL scripts trong `database/` folder
3. Cấu hình RLS policies
4. Enable authentication providers

### **Bước 5: Cấu hình Cloudflare R2**

1. Tạo R2 bucket
2. Upload media files
3. Cấu hình CORS settings
4. Tạo API credentials

---

## **Cách 2: Deploy lên Netlify**

### **Bước 1: Build project**

```bash
npm run build
```

### **Bước 2: Deploy lên Netlify**

1. Đăng nhập vào [Netlify](https://netlify.com)
2. Drag & drop thư mục `out` vào Netlify
3. Cấu hình environment variables
4. Deploy

---

## **Cách 3: Deploy lên Railway**

### **Bước 1: Tạo Railway project**

1. Đăng nhập vào [Railway](https://railway.app)
2. Tạo project mới
3. Connect GitHub repository

### **Bước 2: Cấu hình environment variables**

Thêm các biến môi trường cần thiết

### **Bước 3: Deploy**

Railway sẽ tự động build và deploy

---

## **Cách 4: Deploy lên DigitalOcean App Platform**

### **Bước 1: Tạo App**

1. Đăng nhập vào [DigitalOcean](https://digitalocean.com)
2. Tạo App Platform project
3. Connect GitHub repository

### **Bước 2: Cấu hình**

- Runtime: Node.js
- Build Command: `npm run build`
- Run Command: `npm start`

### **Bước 3: Deploy**

Click "Create Resources" để deploy

---

## **🔧 Cấu hình cần thiết**

### **Environment Variables**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_R2_ENDPOINT=your_r2_endpoint
NEXT_PUBLIC_R2_BUCKET=your_r2_bucket
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
```

### **Database Setup**

1. Chạy `database/add-default-data.sql`
2. Chạy `database/generated/foundation-assets-corrected-final-fixed.sql`
3. Chạy `database/generated/listening-assets.sql`
4. Chạy `database/generated/vocabulary-assets.sql`
5. Chạy `database/generated/pronunciation-assets.sql`

### **R2 Storage Setup**

1. Tạo bucket với tên `ielts-lms-media`
2. Upload media files từ `media/` folder
3. Cấu hình CORS để cho phép access từ domain

---

## **🌐 Chia sẻ với mọi người**

Sau khi deploy thành công, bạn sẽ có URL như:
- Vercel: `https://ielts-lms.vercel.app`
- Netlify: `https://ielts-lms.netlify.app`
- Railway: `https://ielts-lms.railway.app`

Chia sẻ URL này với mọi người để họ có thể sử dụng!

---

## **📱 Mobile App**

Để tạo mobile app, bạn có thể sử dụng:
- **Expo**: `npx create-expo-app --template`
- **React Native**: `npx react-native init`
- **PWA**: Thêm service worker và manifest

---

## **🔒 Security**

- Sử dụng HTTPS
- Cấu hình CORS đúng cách
- Bảo vệ API keys
- Sử dụng RLS trong Supabase
- Validate input data

---

## **📊 Monitoring**

- Sử dụng Vercel Analytics
- Cấu hình error tracking
- Monitor performance
- Set up alerts

---

**Chúc bạn deploy thành công! 🎉**
