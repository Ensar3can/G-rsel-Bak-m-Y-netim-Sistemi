# Görsel Bakım ve Arıza Yönetim Sistemi

Goodyear fabrika ortamı için hazırlanmış **görsel hata bildirim ve bakım yönetimi** uygulaması. Operatörler arızayı telefonla anlatmak yerine makine bölgesini ve parçayı görsel olarak seçer; bakım ekibi kaydı anında görür; yönetim hata trendlerini izler.

Bu sürüm tamamen tarayıcıda çalışır. Gerçek API veya veritabanı zorunlu değildir.

## Kullanılan teknolojiler

- React 18 + TypeScript + Vite 4
- Tailwind CSS
- React Router
- Zustand
- Recharts
- Lucide React
- date-fns
- localStorage + soyut repository katmanı

## Nasıl çalıştırılır

Gereksinim: **Node.js 16+** (18 veya 20 önerilir).

```bash
cd "C:\Users\ensar\OneDrive\Masaüstü\Goodyear"
npm install
npm run dev
```

Tarayıcıda açın: [http://localhost:5173](http://localhost:5173)

### Aynı Wi-Fi’daki telefondan açma (yerel ağ)

Bilgisayar ve telefon **aynı kablosuz ağa** bağlı olsun. Geliştirme sunucusunu ağdan erişilebilir başlatın:

```bash
npm run dev:network
```

Bu komut Vite’ı `0.0.0.0` üzerinden dinletir. Terminalde **Network** satırında görünen adresi kullanın; örnek:

```text
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

Telefondaki tarayıcıya **Network** URL’sini yazın (`localhost` değil). Windows Güvenlik Duvarı 5173 portunu sorarsa bu ağ için izin verin.

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## İnternetten paylaşılabilen canlı demo (Vercel)

Bu proje Vite ile üretilen statik bir sitedir. `vercel.json` React Router yollarının doğrudan açılmasında 404 oluşmaması için SPA yönlendirmesi içerir. API anahtarı gerekmez.

### Vercel hesabı oluşturma / giriş yapma

1. [https://vercel.com/signup](https://vercel.com/signup) adresinden hesap açın veya giriş yapın.
2. GitHub ile bağlanmak en pratik yoldur.

### Projeyi GitHub’a yükleme

Henüz uzak depo yoksa GitHub’da boş bir repository oluşturun, ardından:

```bash
git init
git add .
git commit -m "Görsel bakım demo uygulaması"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

`.env` ve `dist` gibi gizli veya derleme dosyaları `.gitignore` ile dışarıda bırakılır; kaynak koda anahtar yazmayın.

### Vercel’e GitHub üzerinden bağlama

1. Vercel panosunda **Add New → Project**.
2. GitHub deposunu seçin.
3. Framework **Vite**, çıktı dizini **dist** (Vercel bunu çoğu zaman otomatik algılar).
4. Ortam değişkeni eklemeyin; demo tarayıcıda çalışır.

### Deploy işlemi

**Deploy** düğmesine basın. İlk derleme birkaç dakika sürebilir.

### Oluşan herkese açık URL’yi paylaşma

Deploy bitince Vercel bir adres verir, örneğin `https://proje-adi.vercel.app`. Bu linki telefondan veya dışarıdaki kişilerle paylaşabilirsiniz. Adres herkese açıktır; demo verisi tarayıcı `localStorage`’ındadır, ziyaretçiler birbirinin kayıtlarını görmez.

Bu GitHub deposu Vercel’e bağlandığında, main dalına yapılan her başarılı push sonrası demo sitesi otomatik olarak güncellenir.

### Yeni değişiklikleri yayınlama

`main` dalına `git push` yaptığınızda Vercel yeni bir production deploy başlatır. Önizleme için bir pull request da ayrı URL üretir.

## Demo kullanıcı rolleri

Giriş ekranı yoktur. Üst menüdeki **Rol** listesinden geçiş yapın:

| Rol | Demo kullanıcı | Ne görür? |
| --- | --- | --- |
| Operatör | Mehmet Yıldız | Panel, yeni arıza bildirimi, arıza detayı |
| Bakım personeli | Hasan Korkmaz | Panel, bakım panosu (dikey kanban), kayıt güncelleme |
| Yönetici | Selim Arslan | Panel, raporlar, yönetim karar destek ekranı |
| Sistem yöneticisi | Deniz Aksoy | Tüm ekranlar + sistem / veri sıfırlama |

## Ana ekranlar

1. **Kontrol paneli** — Aktif/kritik kayıtlar, bugün açılanlar, trend grafiği, son kayıtlar.
2. **Yeni arıza bildir** — Hat seçimi, üç bölümlü makine şeması, hotspot, yapılandırılmış form. Kayıt `Yeni` durumunda oluşur, localStorage’a yazılır, bakım listesine düşer, detay sayfasına yönlendirilir.
3. **Bakım panosu** — Duruma göre dikey kanban; özet kart ve müdahale paneli.
4. **Arıza detayı** — Görsel konum, zaman çizelgesi, notlar, malzemeler, benzer kayıtlar.
5. **Yapay zekâ önerileri** — Hızlı müdahale / standart / kapsamlı çözüm katmanları; kural tabanlı `aiRecommendationService`. Karar destek uyarısı içerir.
6. **Raporlar** — Haftalık/aylık filtre, grafikler, KPI, yönetici özeti, PDF/Excel yakında mesajı.
7. **Yönetim** — Açık arıza, duruş riski, aksiyon önerileri.
8. **Bildirimler** — Sağ üst rozet; kritik kayıt, üzerine alma, kapatma vb.

Makine görselleri `public/assets/machines/` altındadır. Yollar `src/data/machineAssets.ts` üzerinden yönetilir; gerçek fotoğraflar bu dosyalar değiştirilerek bağlanır.

## Gerçek sisteme geçerken yapılması gerekenler

- `LocalFaultRepository` yerine REST veya GraphQL uygulayan bir repository yazın (`src/services/faultRepository.ts` sözleşmesi).
- Kimlik doğrulamayı AD/SSO ile değiştirin; üst menü rol seçimini kaldırın.
- Fotoğraf ve ses dosyalarını nesne depolamaya yükleyin.
- `RemoteAIRecommendationService` uç noktasını şirket politikasına uygun modele bağlayın. Anahtarları kod içine yazmayın.
- Denetim logu, yetki matrisi ve SLA zamanlayıcılarını sunucuya taşıyın.
- Bildirimleri WebSocket / SignalR ile gerçek zamanlı hale getirin.

## Önerilen gerçek backend mimarisi

- **Frontend:** React (bu uygulama)
- **Backend:** Node.js/NestJS veya .NET
- **Veritabanı:** PostgreSQL
- **Dosya depolama:** Şirket içi sunucu veya güvenli bulut depolama
- **Gerçek zamanlı bildirim:** WebSocket veya SignalR
- **Kullanıcı yönetimi:** Active Directory / SSO
- **Yetki, kayıt geçmişi ve denetim logları:** Sunucu tarafında zorunlu

## Güvenlik notları

- Üretim verisi ve saha fotoğrafları rol tabanlı erişim ile korunmalıdır.
- Hassas veriler uygulama loglarına yazılmamalıdır.
- Yapay zekâya gönderilecek veriler şirket gizlilik politikasına uymalı; mümkünse anonimleştirilmelidir.
- Yapay zekâ önerileri **insan onayı olmadan** otomatik iş emrine veya duruş kararına dönüşmemelidir.
- Bakım müdahalesi kilit/etiket, iş izni ve yetkili personel prosedürüne bağlı kalmalıdır.

## Veri sıfırlama

Sistem yöneticisi ekranındaki **localStorage verisini sıfırla** ile demo verisi yeniden üretilir (sayfayı yenileyin).
