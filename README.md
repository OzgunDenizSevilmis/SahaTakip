# SahaTakip

SahaTakip, saha taleplerinin oluşturulması, personele atanması ve durumlarının izlenmesi için geliştirilmiş bir Expo / React Native uygulamasıdır. Uygulama kullanıcı oturumunu, talepleri ve görselleri Supabase üzerinden yönetir.

## Gereksinimler

- Node.js ve npm
- Expo Go ile uyumlu bir Android veya iOS cihaz ya da yerel simülatör/emülatör
- Supabase projesi (veritabanı ve görsel yüklemeleri için)

Depoda Node.js için sabit bir sürüm belirtilmemiştir. `package.json` içinde Expo `~57.0.24`, React Native `0.86.3` ve React `19.2.3` bağımlılıkları tanımlıdır. Bu sürümlerle uyumlu güncel bir Node.js LTS sürümü kullanın.

## Kurulum

```bash
git clone https://github.com/OzgunDenizSevilmis/SahaTakip.git
cd SahaTakip
npm install
```

## Ortam değişkenleri

Proje kökünde `.env` dosyası oluşturun:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
```

Değerleri Supabase projenizin API ayarlarından alın. Gerçek anahtarları kaynak koda, README'ye veya sürüm kontrolüne eklemeyin. `EXPO_PUBLIC_` ile başlayan değerler uygulamanın istemci paketinde bulunabilir; burada yalnızca Supabase'in istemci için tasarlanmış publishable/anon anahtarını kullanın. `service_role` anahtarını uygulamaya koymayın.

Uygulama `src/services/supabase.ts` içinde bu iki değişkeni zorunlu tutar ve eksik olduklarında başlatma sırasında hata verir. Değişkenleri ekledikten sonra Expo sunucusunu yeniden başlatın.

## Supabase kurulumu

Bu depo Supabase migration'ı, şema SQL'i veya seed verisi içermiyor. Bu nedenle boş bir Supabase projesi tek başına yeterli değildir; uygulamanın beklediği nesneleri ayrıca oluşturmanız gerekir. Aşağıdaki gereksinimler `src/services` ve `src/types/models.ts` içindeki kullanımlardan çıkarılmıştır:

- `profiles`: `id`, `full_name`, `email`, `role`, `avatar_url`, `created_at` alanları kullanılır. Rol değerleri `requester`, `staff` veya `admin` olmalıdır. Oturum açan her kullanıcı için profil kaydının nasıl üretileceğini (ör. güvenli bir veritabanı tetikleyicisi veya yönetilen yönetici süreci) yapılandırın.
- `categories`: talepler bu tabloya `category_id` ile bağlanır ve `name` alanı okunur. Uygulamada kullanılabilir kategori satırları bulunmalıdır.
- `requests`: kod `id`, `title`, `description`, `category_id`, `priority`, `status`, `image_url`, `latitude`, `longitude`, `created_by`, `assigned_to`, `created_at` ve `updated_at` alanlarını kullanır. Öncelik değerleri `low`, `medium`, `high`; durum değerleri `new`, `assigned`, `in_progress`, `resolved`, `cancelled` şeklindedir.
- `status_history`: `id`, `request_id`, `old_status`, `new_status`, `note`, `changed_by`, `changed_at` alanları okunur.
- `change_request_status` RPC'si `p_request_id`, `p_new_status`, `p_note` parametrelerini; `assign_request` RPC'si `p_request_id`, `p_staff_id` parametrelerini kabul etmelidir.
- `request-images` adlı Supabase Storage bucket'ı gerekir. Görseller kullanıcı kimliği klasörü altında saklanır.

İstemci kodunun beklediği alanlar ve çağrılar üstte özetlenmiştir; SQL şeması, foreign key'ler, kısıtlar, fonksiyonların yetkilendirme mantığı ve Row Level Security politikaları bu depoda tanımlanmadığı için burada doğrulanmış kurulum adımları olarak verilemez. Özellikle RLS politikalarını kullanıcı rollerine ve veri erişim kurallarınıza göre güvenli biçimde yapılandırmadan uygulamayı gerçek kullanıcı verileriyle kullanmayın.

## Uygulamayı başlatma

```bash
npm start
```

Bu komut Expo geliştirme sunucusunu açar. Terminalde gösterilen QR kodunu Expo Go ile tarayın. Alternatif script'ler:

```bash
npm run android
npm run ios
npm run web
```

Bu komutlar sırasıyla Expo'yu Android, iOS veya web hedefiyle başlatır. iOS simülatörünü çalıştırmak için macOS ve Xcode gerekir; Android emülatörü için Android Studio/emülatör kurulumu gerekir.

## Test ve doğrulama durumu

`package.json` içinde test, lint veya type-check script'i tanımlı değildir. Depoda test yapılandırması/komutları da görünmemektedir. Bu nedenle README hazırlanırken otomatik test veya başarılı derleme sonucu iddia edilmemiştir. Mevcut npm script'leri yalnızca `start`, `android`, `ios` ve `web` başlatma komutlarıdır.

## Proje yapısı

```text
App.tsx
index.ts
src/
  components/
  hooks/
  navigation/
  screens/
  services/
  store/
  theme/
  types/
  utils/
assets/
```
