# Freelance OS: Yol Haritası ve Mevcut Eksikler

Bu doküman, mevcut kod yapısı ile hedeflenen "Freelance OS" arasındaki farkları ve bu farkları kapatmak için izlenecek adım adım planı içerir.

---

## 🚩 Mevcut Durum Analizi (Eksikler)

Şu anki uygulama görsel olarak şık bir **"UI Shell" (Arayüz Kabuğu)** aşamasındadır. Ancak fonksiyonel bir OS olması için aşağıdaki temel yapı taşları eksiktir:

### 1. Veri ve Süreklilik (Persistence)
*   [ ] **Veritabanı Bağlantısı Yok:** Uygulama yenilendiğinde tüm değişiklikler kaybolur (Veriler şimdilik `const` değişkenlerde tutuluyor).
*   [ ] **Supabase Entegrasyonu:** Gerçek zamanlı veri akışı ve tablo yapıları kurulmadı.
*   [ ] **Görseller/Dosyalar:** Müşteri logoları veya PDF teklifler için bir depolama (Storage) alanı yok.

### 2. Güvenlik ve Kimlik
*   [ ] **Auth Sistemi:** Herkes uygulamaya erişebilir. Kişisel verilerin korunması için giriş (Login) ekranı yok.
*   [ ] **Hassas Veri Şifreleme:** SSH key ve Env verileri veritabanında "plain-text" yerine şifreli (Encrypted) saklanmalı.

### 3. Fonksiyonel Özellikler
*   [ ] **Aktif Kanban:** Kartlar sürüklenemiyor, aşamalar arası geçiş mantığı kodlanmadı.
*   [ ] **PDF Export:** Teklifleri profesyonel dökümana dönüştürecek motor eksik.
*   [ ] **Zengin Metin Editörü:** Notlar kısmı düz metin (plain text) yerine yazılımcı dostu bir editöre (Markdown/Code) sahip değil.
*   [ ] **Finansal Mantık:** Overdue (vadesi geçmiş) ödemeleri hesaplayan dinamik filtreler henüz yok.

---

## 🗺️ Adım Adım Yol Haritası (Roadmap)

### **Faz 1: Kalp Ameliyatı (Altyapı)**
*   **Adım 1:** Supabase projesinin oluşturulması ve React bağlantısının kurulması.
*   **Adım 2:** Veritabanı şemasının (SQL) çalıştırılması (`clients`, `proposals`, `notes` vb.).
*   **Adım 3:** Supabase Auth ile "Admin Girişi" yapılması.
*   **Adım 4:** Statik verilerin (JSON) veritabanına taşınması ve uygulamadan okunması.

### **Faz 2: Satış ve CRM Motoru**
*   **Adım 1:** `dnd-kit` entegrasyonu ile Kanban kartlarını gerçek zamanlı oynatılabilir yapma.
*   **Adım 2:** "Müşteri Ekle" ve "Teklif Oluştur" formlarının yapılması.
*   **Adım 3:** Follow-up (Takip) tarihi gelen işler için UI bildirimleri.

### **Faz 3: Yazılımcı Bilgi Bankası**
*   **Adım 1:** Notlar kısmına **TipTap** veya **Monaco Editor** entegrasyonu (Kod renklendirme için).
*   **Adım 2:** "Hassas Veri" alanı için "Reveal on Click" fonksiyonunun güvenli backend ile bağlanması.
*   **Adım 3:** `CodeSnippets` ekranının ana menüye (App.tsx) bağlanması ve aktif edilmesi.

### **Faz 4: Profesyonel Çıktılar ve Finans**
*   **Adım 1:** `react-pdf` ile tekliflerin dökümana dökülmesi.
*   **Adım 2:** Ödeme durumu `Paid/Unpaid` olan fatura takip sistemi.
*   **Adım 3:** Proje detay sayfasında basit bir "Start/Stop" zaman sayacı (Timer).

### **Faz 5: Dış Entegrasyonlar**
*   **Adım 1:** Google Calendar üzerinden toplantıların çekilmesi.
*   **Adım 2:** Müşterilere özel "Randevu Alma" (Calendly benzeri) sayfasının public olarak açılması.

---

## 🛠️ Bir Sonraki Kritik Adım
Uygulamayı bir "kabuk"tan gerçek bir "araç"a dönüştürmek için:
**Öneri:** Faz 1, Adım 1 & 2'den (Supabase kurulumu ve API bağlantısı) başlayalım.
