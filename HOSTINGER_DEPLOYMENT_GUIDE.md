# Hostinger Deployment Guide - Tever Orman Mamulleri Web Sitesi

Bu rehber, statik web sitenizi **www.teverorman.com** domain'ine Hostinger üzerinden yayınlamak için adım adım talimatlar içermektedir.

---

## 📋 ÖN HAZIRLIK

### 1. Dosyaları Hazırlama

**1.1. Yerel Klasör Oluşturma**
- Bilgisayarınızda masaüstünde veya istediğiniz bir konumda `teverorman-website` adında yeni bir klasör oluşturun.

**1.2. Dosyaları Kaydetme**
- `index.html` dosyasını oluşturduğunuz klasöre kaydedin.
- `styles.css` dosyasını aynı klasöre kaydedin.
- `logo.svg` dosyasını aynı klasöre kaydedin.

**ÖNEMLİ:** Dosyaları kaydederken:
- **Dosya adlarının tam olarak doğru olduğundan emin olun** (büyük/küçük harf duyarlı):
  - `index.html` (küçük harf, nokta ile)
  - `styles.css` (küçük harf, nokta ile)
  - `logo.svg` (küçük harf, nokta ile)
- **Kodlama (encoding):** UTF-8 olarak kaydedin (çoğu metin editörü varsayılan olarak UTF-8 kullanır).

**1.3. Dosya Yapısı Kontrolü**
Klasörünüzün içeriği şöyle görünmelidir:
```
teverorman-website/
  ├── index.html
  ├── styles.css
  └── logo.svg
```

---

## 🌐 HOSTINGER PANELİNE GİRİŞ

### 2. Hostinger hPanel'e Giriş

**2.1. Hostinger Web Sitesine Gidin**
- Tarayıcınızda [www.hostinger.com](https://www.hostinger.com) adresine gidin.
- Sağ üst köşedeki **"Giriş Yap"** butonuna tıklayın.

**2.2. Hesabınıza Giriş Yapın**
- E-posta adresinizi ve şifrenizi girerek giriş yapın.
- hPanel (Hostinger Panel) ana sayfasına yönlendirileceksiniz.

---

## 📁 DOSYA YÖNETİCİSİNE ERİŞİM

### 3. File Manager'ı Açma

**3.1. Hosting Bölümüne Gidin**
- hPanel ana sayfasında **"Hosting"** sekmesine tıklayın.
- Veya doğrudan **"Yönet"** (Manage) butonuna tıklayın.

**3.2. File Manager'ı Açın**
- Açılan sayfada **"Dosya Yöneticisi"** (File Manager) veya **"Files"** seçeneğine tıklayın.
- Alternatif olarak, sol menüden **"Files"** → **"File Manager"** yolunu takip edebilirsiniz.

**3.3. public_html Klasörüne Gidin**
- File Manager açıldığında, sol tarafta veya ana alanda **`public_html`** klasörünü göreceksiniz.
- **`public_html`** klasörüne çift tıklayarak içine girin.
- **ÖNEMLİ:** Tüm web sitesi dosyalarınızı bu klasöre yüklemelisiniz.

---

## 🗑️ ESKİ DOSYALARI TEMİZLEME

### 4. Varsayılan Dosyaları Silme/Değiştirme

**4.1. Mevcut index Dosyalarını Kontrol Edin**
- `public_html` klasöründe varsayılan olarak `index.html`, `index.php` veya benzeri dosyalar olabilir.
- Bu dosyaları **silmeniz veya yeniden adlandırmanız** gerekiyor (örneğin: `index.html.old`).

**4.2. Silme İşlemi**
- Silmek istediğiniz dosyaya sağ tıklayın.
- **"Delete"** (Sil) seçeneğini seçin.
- Onay mesajını kabul edin.

**NOT:** Eğer Hostinger'ın varsayılan bir sayfası varsa ve silmek istemiyorsanız, sadece `index.html` adını değiştirebilirsiniz (örneğin: `default.html`).

---

## 📤 DOSYALARI YÜKLEME

### 5. Dosyaları Hostinger'a Yükleme

**5.1. Yükleme Yöntemi Seçimi**
Hostinger File Manager'da dosya yükleme için iki yöntem vardır:

**Yöntem A: Tek Tek Dosya Yükleme (Önerilen)**
1. File Manager'ın üst kısmında **"Upload"** (Yükle) butonuna tıklayın.
2. Açılan pencerede **"Select Files"** (Dosya Seç) butonuna tıklayın.
3. Bilgisayarınızdan `index.html` dosyasını seçin ve yükleyin.
4. Aynı işlemi `styles.css` ve `logo.svg` için tekrarlayın.

**Yöntem B: Toplu Yükleme (ZIP ile)**
1. Yerel klasörünüzdeki tüm dosyaları (`index.html`, `styles.css`, `logo.svg`) bir ZIP dosyasına sıkıştırın.
2. File Manager'da **"Upload"** butonuna tıklayın.
3. ZIP dosyasını seçin ve yükleyin.
4. ZIP dosyası yüklendikten sonra, dosyaya sağ tıklayın ve **"Extract"** (Aç) seçeneğini seçin.
5. ZIP dosyasını silebilirsiniz.

**5.2. Dosyaların Konumunu Kontrol Edin**
- Yükledikten sonra, `public_html` klasöründe şu dosyaların olduğundan emin olun:
  - `index.html`
  - `styles.css`
  - `logo.svg`

**5.3. Dosya İzinlerini Kontrol Edin (Opsiyonel)**
- Dosyalara sağ tıklayıp **"Change Permissions"** (İzinleri Değiştir) seçeneğini kontrol edin.
- Genellikle `644` izni yeterlidir (Hostinger varsayılan olarak doğru izinleri ayarlar).

---

## ✅ SİTEYİ TEST ETME

### 6. Web Sitesini Kontrol Etme

**6.1. Domain'inizi Ziyaret Edin**
- Tarayıcınızda **`https://www.teverorman.com`** adresine gidin.
- Veya **`http://www.teverorman.com`** (henüz SSL aktif değilse).

**6.2. Görsel Kontroller**
- Ana sayfa düzgün görünüyor mu?
- Logo görünüyor mu?
- Stil ve renkler doğru mu?
- Tüm bölümler (Ürünler, Kullanım Alanları, vb.) görünüyor mu?

**6.3. Mobil Görünümü Test Edin**
- Tarayıcınızın geliştirici araçlarını açın (F12 tuşu).
- Mobil görünüm modunu aktif edin (cihaz simgesi).
- Farklı ekran boyutlarında test edin.

**6.4. Linkleri Test Edin**
- Header'daki navigasyon linklerinin çalıştığından emin olun.
- "Teklif Al" butonlarının `#iletisim` bölümüne gittiğini kontrol edin.

---

## 🔒 SSL SERTİFİKASI KURULUMU

### 7. HTTPS'i Etkinleştirme

**7.1. SSL Sertifikası Kurulumu**
- hPanel ana sayfasına dönün.
- **"Hosting"** → **"SSL"** veya **"Security"** bölümüne gidin.
- **"Let's Encrypt"** veya **"Free SSL"** seçeneğini bulun.
- `teverorman.com` domain'iniz için SSL sertifikasını aktif edin.
- **"Install"** (Kur) veya **"Activate"** (Aktif Et) butonuna tıklayın.
- Kurulum birkaç dakika sürebilir.

**7.2. HTTPS Yönlendirmesi (HTTP'den HTTPS'e)**
- hPanel'de **"Advanced"** (Gelişmiş) veya **"Website"** bölümüne gidin.
- **"Force HTTPS"** (HTTPS'i Zorla) seçeneğini aktif edin.
- Veya `.htaccess` dosyası oluşturup şu kodu ekleyebilirsiniz:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**7.3. SSL Testi**
- Birkaç dakika bekleyin.
- Tarayıcınızda **`https://www.teverorman.com`** adresine gidin.
- Adres çubuğunda kilit simgesi görünmelidir.

---

## 🔧 SORUN GİDERME

### 8. Olası Sorunlar ve Çözümleri

**Sorun: Sayfa görünmüyor / "Index of" sayfası görünüyor**
- **Çözüm:** `index.html` dosyasının `public_html` klasöründe olduğundan ve adının tam olarak `index.html` olduğundan emin olun.

**Sorun: Stil dosyası yüklenmiyor (CSS çalışmıyor)**
- **Çözüm:** `styles.css` dosyasının `public_html` klasöründe olduğundan ve `index.html` içindeki link yolunun doğru olduğundan emin olun (`<link rel="stylesheet" href="styles.css">`).

**Sorun: Logo görünmüyor**
- **Çözüm:** `logo.svg` dosyasının `public_html` klasöründe olduğundan ve `index.html` içindeki img src yolunun doğru olduğundan emin olun (`<img src="logo.svg" ...>`).

**Sorun: Domain henüz aktif değil**
- **Çözüm:** Domain'inizin DNS ayarlarının Hostinger'a yönlendirildiğinden emin olun. DNS yayılması 24-48 saat sürebilir.

**Sorun: SSL sertifikası kurulmuyor**
- **Çözüm:** Domain'in DNS ayarlarının tamamen yayıldığından emin olun. Hostinger destek ekibiyle iletişime geçebilirsiniz.

---

## 📝 SON KONTROLLER

### 9. Yayın Öncesi Kontrol Listesi

- [ ] `index.html`, `styles.css`, `logo.svg` dosyaları `public_html` klasöründe.
- [ ] Eski `index.*` dosyaları silindi veya yeniden adlandırıldı.
- [ ] Web sitesi `https://www.teverorman.com` adresinde görünüyor.
- [ ] Logo ve stiller düzgün yükleniyor.
- [ ] Tüm bölümler ve linkler çalışıyor.
- [ ] Mobil görünüm test edildi.
- [ ] SSL sertifikası aktif ve HTTPS çalışıyor.

---

## 🎉 TAMAMLANDI!

Web siteniz artık **www.teverorman.com** adresinde yayında!

---

## 📌 SONRAKI ADIMLAR (Opsiyonel)

### Google Analytics Ekleme
1. Google Analytics hesabı oluşturun ve tracking kodunu alın.
2. `index.html` dosyasını düzenleyin.
3. `</head>` etiketinden hemen önce Google Analytics kodunu ekleyin:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Meta Pixel (Facebook) Ekleme
1. Facebook Business Manager'dan Pixel kodunu alın.
2. `index.html` dosyasında `</head>` etiketinden önce Pixel kodunu ekleyin.

### Çoklu Sayfa Yapısına Geçiş
- Gelecekte birden fazla sayfa eklemek isterseniz:
  - Her sayfa için ayrı HTML dosyası oluşturun (örneğin: `urunler.html`, `hakkimizda.html`).
  - `public_html` klasörüne yükleyin.
  - Navigasyon linklerini güncelleyin.

---

**Sorularınız için:** Hostinger destek ekibiyle 7/24 canlı sohbet üzerinden iletişime geçebilirsiniz.

**Başarılar dileriz!** 🚀

