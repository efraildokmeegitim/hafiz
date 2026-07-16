<div align="center">
  <h1>📖 Hafız Yol Arkadaşım</h1>
  <p>Diyanet usulü hafızlık yapımını dijitalleştiren, modern ve akıllı bir hafızlık takip & çalışma platformu.</p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-V10-FFCA28?logo=firebase" alt="Firebase" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" alt="TypeScript" /></a>
    <a href="#-lisans"><img src="https://img.shields.io/badge/Lisans-MIT-green" alt="Lisans: MIT" /></a>
  </p>
</div>

<br />

Hafızlık sürecindeki öğrencilerin ezberlerini pekiştirmesi, hocaların ise talebelerini anlık olarak takip edebilmesi için tasarlanmış açık kaynaklı bir platformdur. Amacımız, kadim hafızlık geleneğini modern teknolojinin imkanlarıyla birleştirerek bu süreci kolaylaştırmaktır.

## ✨ Özellikler

- 📖 **Diyanet Usulü Hafızlık:** Cüzlerin son sayfalarından başlayarak başa doğru ilerleyen geleneksel hafızlık usulüne (Sayfa, Cüz, Has, Ham, Pekişmiş) tam uyum.
- 🎧 **Akıllı Ses & Tekrar (Spaced Repetition):** Belirli ayet aralıklarını istenilen sayıda (hız ayarı ile) tekrar ettirebilme, sesli (Kuran.com API destekli) okuma ve satır takibi.
- 📶 **Offline Çalışma (PWA):** İnternet bağlantısı koptuğunda dahi önbelleğe alınan sayfalarla çalışma ve dinleme imkanı. Firebase Offline Persistence ve Service Worker entegrasyonu.
- 👨‍🏫 **Hoca & Talebe Sistemi:** Hocaların talebelerini gruplar (halkalar) halinde ekleyip ezber durumlarını anlık olarak panodan takip edebilmesi.
- 🎨 **Gelişmiş Modern Temalar:** Zümrüt (Açık), Gece (Koyu), Okyanus ve Çöl gibi modern renk paletleriyle göz yormayan (Glassmorphism & Mesh Gradient) arayüz deneyimi.
- 📱 **Cross-Platform:** Hem mobil cihazlarda hem de masaüstü web ortamında kusursuz görünüm ve PWA desteği.

## 🛠 Kullanılan Teknolojiler

- **Frontend:** Next.js (App Router), React, TypeScript
- **Stil & UI:** Vanilla CSS (CSS Variables, Glassmorphism), Lucide React (İkonlar), Recharts (Grafikler)
- **Backend & Veritabanı:** Firebase (Auth, Firestore, Offline Persistence)
- **Tema Yönetimi:** next-themes (Sistem entegreli karanlık/aydınlık mod)
- **Veri Kaynakları:** Kuran.com API (Ses, Meal ve Tefsir)

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda geliştirmek veya incelemek isterseniz aşağıdaki adımları takip edebilirsiniz:

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/hafiz.git
   cd hafiz
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Firebase Ortam Değişkenlerini Ayarlayın:**
   Proje ana dizininde bir `.env.local` dosyası oluşturun. Kendi [Firebase](https://console.firebase.google.com/) konsolunuzdan oluşturduğunuz projenin bilgilerini girin:
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

Tarayıcınızdan `http://localhost:3000` adresine giderek uygulamaya erişebilirsiniz.

## 🤝 Katkıda Bulunma (Contributing)

Bu proje **açık kaynaklıdır** ve topluluğun katkılarına her zaman açıktır! Hafızlık sürecini daha iyi hale getirecek her türlü fikre, kod katkısına ve tasarım geliştirmesine açığız.

Katkıda bulunmak için:
1. Bu depoyu (repository) **Fork**'layın.
2. Yeni bir dal (branch) oluşturun (`git checkout -b feature/YeniOzellik`).
3. Değişikliklerinizi işleyin (commit edin) (`git commit -m 'feat: Yeni özellik eklendi'`).
4. Dalınıza gönderin (push) (`git push origin feature/YeniOzellik`).
5. Bir **Pull Request (PR)** açın.

Lütfen mevcut olan Hatalar (Issues) sekmesine göz atmayı veya yeni bir özellik eklemeden önce tartışma (Discussion/Issue) açmayı unutmayın.

## 📝 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına (veya kodların kullanım detaylarına) bakabilirsiniz. Özgürce kullanabilir, kopyalayabilir ve değiştirebilirsiniz. Duanızda bizi de unutmayın. 🤲
