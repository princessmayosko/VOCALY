KONDUKTÖR — SES MOTORU DENEME SÜRÜMÜ

İçerik:
- index.html: mevcut görsel + ses kontrolü
- scene.png: mevcut sahne görseli
- konduktor_kopru.py: mevcut Arduino/Python köprüsü
- istiklal_marsi.mp3: yüklediğiniz MP3

Çalıştırma:
1) ZIP'i klasöre çıkarın.
2) Arduino köprüsünü eskisi gibi çalıştırın: py konduktor_kopru.py
3) Tarayıcıda http://127.0.0.1:8000 açın.
4) Tarayıcı ses güvenliği nedeniyle INTRO'YU BAŞLAT düğmesine bir kez basın.
5) Intro 2.623 saniyede durur.
6) Arduino hareketleriyle ray görseli ve ses ilerleme mantığını test edin.

ÖNEMLİ PROTOTİP NOTU:
- 2.623, 3.500 ve 4.300 saniye kullanıcı tarafından verilen marker'lardır.
- 4.800 saniye KORK girişi için geçici tahmindir; Audacity'de doğrulanmalıdır.
- Bu ilk sürümde ses bölümleri marker sınırlarına göre kesilir; fade yaklaşık 25 ms'dir.
- Mevcut MP3 üzerinde tam müzikal marker'lar doğrulanmadan kesintisiz/profesyonel ses garantisi verilemez.
- Intro'dan sonra segment ilerleme mantığını ve Arduino yön eşleşmesini gerçek cihazla test edin.


DÜZELTME V2.1:
KORK hecesinden sonra sesin tekrar KORK'a dönmesine neden olan geri sarma kaldırıldı. KORK girişinden sonraki her kabul edilen hareket, MP3'ün kaldığı yerden sonraki 1,5 saniyeyi çalar.


V2.2 DÜZELTMELERİ:
- Arayüz artık sensörden gelen DOWN/UP/LEFT/RIGHT olaylarının hepsini tetik olarak kabul eder ve ışığı sıradaki raya kanalize eder. Böylece yön eşleşmesi yüzünden olayların arayüzde kaybolması önlenir.
- KORK sonrasında ses, mevcut oynatma konumundan 2 saniyelik bölümlerle ilerler.
- SIFIRLA ses motorunu ve hareket kuyruğunu da sıfırlar.
Bu sürüm gerçek donanımda ayrıca test edilmelidir.


V2.3 AYARI:
KORK sonrasinda her kabul edilen hareketin ilerlettigi ses parcasi 2.0 saniyeden 1.2 saniyeye indirildi. Daha kisa/uzun istenirse bu deger index.html icinde ayarlanabilir.


V2.4 GECİKME DÜZELTMESİ:
- Görsel hareket animasyonu 430 ms'den 180 ms'ye indirildi.
- Yeni hareket geldiğinde önceki animasyonun tamamlanması beklenmiyor; nokta bulunduğu yerden sıradaki hedefe yöneliyor.
- Tarayıcının Python köprüsünü yoklama aralığı 60 ms'den 20 ms'ye indirildi.
- Hareketler kuyruğunun geride birikmesini azaltmak için kuyruk en fazla 4 olay tutuyor; çok hızlı hareketlerde en eski bekleyen olay düşürülebilir.
- Olaylar arasındaki asgari bekleme 180 ms'den 70 ms'ye indirildi.

Bu sürüm kod düzeyinde düzenlenmiştir; gerçek Arduino ve tarayıcı üzerinde donanım testi yapılmamıştır. V2.3 klasörünün üzerine yazmak yerine ayrı klasöre çıkarıp test edin.
