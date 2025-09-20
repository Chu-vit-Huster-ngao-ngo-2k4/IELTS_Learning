# 🚀 Quick Start Guide

## **Deploy trong 5 phút!**

### **1. Tạo GitHub Repository**

```bash
# Tạo repository mới trên GitHub
# Copy URL repository
```

### **2. Push code lên GitHub**

```bash
git remote add origin https://github.com/yourusername/ielts-lms.git
git push -u origin master
```

### **3. Deploy lên Vercel**

1. Vào [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import từ GitHub
4. Cấu hình environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_R2_ENDPOINT`
   - `NEXT_PUBLIC_R2_BUCKET`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
5. Click "Deploy"

### **4. Cấu hình Database**

1. Vào Supabase Dashboard
2. Chạy SQL scripts trong `database/` folder
3. Enable authentication

### **5. Cấu hình Storage**

1. Tạo Cloudflare R2 bucket
2. Upload media files
3. Cấu hình CORS

### **6. Chia sẻ!**

Sau khi deploy, bạn sẽ có URL như:
`https://ielts-lms.vercel.app`

Chia sẻ URL này với mọi người! 🎉

---

## **🔧 Cấu hình cần thiết**

### **Supabase**
- Tạo project mới
- Chạy SQL scripts
- Enable authentication

### **Cloudflare R2**
- Tạo bucket
- Upload media files
- Tạo API credentials

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_R2_ENDPOINT=your_r2_endpoint
NEXT_PUBLIC_R2_BUCKET=your_r2_bucket
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
```

---

## **📱 Mobile App**

Để tạo mobile app:
```bash
npx create-expo-app --template
```

---

## **🌐 PWA Support**

App đã hỗ trợ PWA, có thể cài đặt như app native!

---

**Chúc bạn thành công! 🎉**
