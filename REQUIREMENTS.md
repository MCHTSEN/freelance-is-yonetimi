# Freelance OS: Ürün Spesifikasyon Dokümanı (Target OS)

## 🎯 Vizyon ve Amaç
Bir yazılımcı olarak tüm iş akışını (müşteri ilişkileri, teknik notlar, finans ve zaman yönetimi) tek bir merkezden, profesyonel bir "İşletim Sistemi" estetiğiyle yönetmek. Harici araçlara (Notion, Trello, Jira) olan bağımlılığı azaltıp, yazılımcı ihtiyaçlarına (Code snippets, Env vars, SSH keys) odaklanmış kişiselleştirilmiş bir çözüm sunmak.

---

## 🚀 Temel Modüller ve Özellikler

### 1. CRM & Pipeline (Satış Öncesi ve İlişkiler)
*   **Kanban Görünümü:** Müşteri adaylarını durumlarına göre sürükle-bırak yönetimi.
    *   *Aşamalar:* Lead -> Görüşüldü -> Teklif Gönderildi -> Sözleşme Aşamasında -> Kazanıldı/Kaybedildi.
*   **Teklif Takibi:** Gönderilen tekliflerin geçmişi ve durumu.
*   **Akıllı Takip (Follow-up):** Takip edilmesi gereken tarihlerde otomatik hatırlatıcılar.
*   **Müşteri Arşivi:** Müşteri bazlı iletişim geçmişi ve özel notlar.

### 2. Teknik Notlar & Bilgi Bankası (Knowledge Base)
*   **Zengin Metin Editörü:** Markdown destekli, kod blokları için "Syntax Highlighting" içeren geliştirilmiş editor.
*   **Snippet Library:** Sık kullanılan kod parçacıklarının kategorize edilmiş hali.
*   **Hassas Veri Yönetimi:**
    *   SSH Key'leri ve Environment Variable notları.
    *   "Tap to reveal" (Tıkla ve göster) özellikli güvenlik katmanı.
    *   Sunucu adresleri ve teknik erişim bilgileri arşivi.

### 3. Toplantı ve Zaman Yönetimi
*   **Akıllı Toplantı Notları:** Takvimdeki bir etkinliğe tıklandığında otomatik olarak o toplantı için bir not sayfası açılması.
*   **Otomatik İlişkilendirme:** Notların otomatik olarak ilgili müşteri ve projeye bağlanması.
*   **Zaman Takibi (Time Tracking):** Proje bazlı harcanan sürenin ölçülmesi (Gerçekçi teklifler verebilmek için veri toplama).
*   **Takvim Entegrasyonu:** Google/Outlook takvimi ile çift taraflı senkronizasyon.

### 4. Finans ve Operasyon
*   **Teklif Oluşturucu:** PDF formatında dışa aktarılabilen, profesyonel şablonlu teklif hazırlama modülü.
*   **Tahsilat Takibi:** Ödenmemiş veya vadesi geçmiş faturaları kırmızı ile vurgulayan (animate-pulse) dinamik liste.
*   **Gelir/Gider Raporlama:** Proje bazlı karlılık ve genel finansal durum özeti.

---

## 🏗️ Teknik Mimari

| Bileşen | Seçilen Teknoloji | Neden? |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Hızlı UI döngüsü ve geniş kütüphane desteği. |
| **Styling** | Tailwind CSS | Hızlı tasarım ve OS estetiği için utility-first yaklaşım. |
| **Backend/DB** | Supabase (PostgreSQL) | Realtime veritabanı, Auth ve dosya depolama kolaylığı. |
| **Editor** | TipTap / react-markdown | Yazılımcı dostu zengin metin ve kod blokları. |
| **PDF** | react-pdf | Dinamik teklifleri profesyonel dökümana dönüştürme. |

---

## 📊 Veritabanı Şeması (Taslak)

- **`clients`**: ad, soyad, e-posta, şirket, durum.
- **`pipeline`**: client_id, aşama, tahmini_değer, follow_up_date.
- **`proposals`**: client_id, tutar, içerik (markdown), status, pdf_url.
- **`projects`**: client_id, ad, baslangic_tarihi, bitis_tarihi, teknik_detaylar.
- **`notes`**: content (markdown), project_id, type (toplantı/teknik), created_at.
- **`invoices`**: project_id, tutar, due_date, is_paid.

---

## 🗺️ Uygulama Yol Haritası (Roadmap)

### **Faz 1: Temel OS Altyapısı**
- Supabase entegrasyonu ve Auth (Giriş) sistemi.
- Veritabanı şemalarının kurulması.

### **Faz 2: Satış ve CRM (MVP)**
- Kanban Pipeline ekranının dinamik hale getirilmesi.
- Müşteri ekleme/düzenleme modülleri.

### **Faz 3: Teknik Notlar ve Editör**
- Markdown destekli gelişmiş not alma alanı.
- Code snippet library entegrasyonu.

### **Faz 4: Finans ve PDF**
- Teklif oluşturucu ve PDF export.
- Tahsilat takip listesi ve finansal dashboard.

### **Faz 5: Entegrasyonlar**
- Google/Outlook Takvim senkronizasyonu.
- Bildirim sistemi (Push/Telegram).
