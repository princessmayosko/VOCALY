VOCALY KONDUKTOR SERBEST HAREKET v5

Bu sürüm SerbestHareket_Final_v4 temelinden geliştirilmiştir.

Amaç:
- YUKARI/AŞAĞI çalışan hareketi korumak.
- SAĞ/SOL için telefonun eğimini komut olarak kullanmamak.
- accelerationIncludingGravity + DeviceOrientation ile yerçekimi bileşenini
  matematiksel olarak çıkarıp yalnızca doğrusal X/Y hareketi kullanmak.
- orientation yalnızca gravity compensation içindir; kullanıcı hareketi olarak
  değerlendirilmez.
- Z/ileri-geri ekseni kontrol için kullanılmaz.

Kullanım:
1. GitHub Pages'e indexconductor-phone.html ve indexconductor-receiver.html yükle.
2. Bilgisayarda receiver sayfasını aç.
3. Kodu telefona gir.
4. Bağlan ve sensörü başlat.
5. Telefon ekranı yukarı bakacak şekilde tutulabilir.
6. Önce telefonu sağa/sola FİZİKSEL OLARAK götür; eğmeden test et.
7. Sonra yalnızca sağa/sola hafifçe eğ ve elin hareket edip etmediğine bak.

Not:
Bu sürümde 4/4 paterni yoktur. Amaç yalnızca doğal serbest X/Y hareketini düzeltmektir.
