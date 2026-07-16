# Hafız Yol Arkadaşım

Diyanet usulü hafızlık yapımını dijitalleştiren, modern ve akıllı bir hafızlık takip & çalışma platformu. 

Hafızlık sürecindeki öğrencilerin ezberlerini pekiştirmesi, hocaların ise talebelerini anlık olarak takip edebilmesi için tasarlanmıştır.

## 🌟 Özellikler

- **Diyanet Usulü Hafızlık:** Cüzlerin son sayfalarından başlayarak başa doğru ilerleyen geleneksel hafızlık usulüne tam uyum.
- **Akıllı Ses & Tekrar (Spaced Repetition):** Belirli ayet aralıklarını istenilen sayıda tekrar ettirebilme, sesli (Kuran.com API destekli) okuma takibi.
- **Offline Çalışma (PWA):** İnternet olmadan da çalışma ve dinleme imkanı. (Firebase Offline Persistence ve Service Worker entegrasyonu).
- **Hoca & Talebe Sistemi:** Hocaların talebelerini (halka/grup bazında) ekleyip onların "Ham", "Has", "Pekişmiş" durumlarını anlık takip edebilmesi.
- **Gelişmiş Temalar:** Zümrüt (Açık), Gece (Koyu), Okyanus ve Çöl gibi modern renk paletleriyle göz yormayan (Glassmorphism & Mesh Gradient) arayüz deneyimi.
- **Responsive Tasarım:** Hem mobil cihazlarda (iOS/Android için Capacitor uyumlu) hem de web ortamında kusursuz görünüm.

## 🛠 Kullanılan Teknolojiler

- **Frontend:** Next.js (App Router), React, TypeScript
- **Stil & UI:** Vanilla CSS (CSS Variables), Glassmorphism, Lucide React (İkonlar), Recharts (Grafikler)
- **Backend & Veritabanı:** Firebase Firestore (Realtime Database & Offline Persistence)
- **Tema Yönetimi:** next-themes
- **Veri Kaynakları:** Kuran.com API (Ses ve Meal/Tefsir verileri), Yerel JSON Mushaf Veritabanı

## 🚀 Kurulum

Projeyi bilgisayarınızda yerel olarak çalıştırmak için aşağıdaki adımları takip edin:

1. **Depoyu Klonlayın:**
   ```bash
   git clone <REPO_URL>
   cd hafiz
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Firebase Ortam Değişkenlerini Ayarlayın:**
   Proje ana dizininde bir `.env.local` dosyası oluşturun ve kendi Firebase yapılandırmanızı ekleyin:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```

5. Tarayıcınızdan `http://localhost:3000` adresine giderek uygulamayı görüntüleyin.

## 📱 PWA Olarak Kullanım

Uygulama tam bir PWA (Progressive Web App) olarak tasarlanmıştır. Tarayıcı menüsünden "Ana Ekrana Ekle" diyerek mobil cihazınızda native bir uygulama gibi kullanabilirsiniz.

## 🤝 Katkıda Bulunma

Bu proje açık kaynaklı değildir, ancak katkıda bulunmak (Pull Request) veya hata bildirmek (Issue) isterseniz depoyu forklayarak değişiklik önerebilirsiniz.

## 📝 Lisans

Tüm hakları saklıdır.
