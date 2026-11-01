from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from collections import deque
import json
import threading
import time
import serial

# Arduino UNO / MPU6050 setup
PORT_NAME = "COM5"
BAUD_RATE = 9600
WEB_PORT = 8000
HTML_FILE = Path(__file__).with_name("index.html")
event_queue = deque()
queue_lock = threading.Lock()

def serial_reader():
    while True:
        try:
            print(f"Arduino baglantisi aciliyor: {PORT_NAME} @ {BAUD_RATE}")
            with serial.Serial(PORT_NAME, BAUD_RATE, timeout=1) as ser:
                time.sleep(2)  # Arduino resets when serial port opens.
                print("Arduino baglandi. DOWN / UP / RIGHT / LEFT emirleri bekleniyor.")
                while True:
                    line = ser.readline().decode("utf-8", errors="ignore").strip().upper()
                    if not line:
                        continue
                    print("Arduino:", line)
                    # Eski test kodlarının X:/Y: tanı satırlarını ve UNKNOWN'u kuyruğa alma.
                    if line in {"DOWN", "UP", "RIGHT", "LEFT"}:
                        with queue_lock:
                            # Kuyruğun büyümesini önle; en yeni 20 olayı tut.
                            if len(event_queue) >= 20:
                                event_queue.popleft()
                            event_queue.append(line)
        except serial.SerialException as exc:
            print("Seri port hatasi:", exc)
            print("Arduino IDE Serial Monitor kapali mi? COM5 dogru mu?")
            time.sleep(3)

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/next-event":
            with queue_lock:
                event_name = event_queue.popleft() if event_queue else None
            payload = json.dumps({"event": event_name}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if self.path == "/" or self.path.startswith("/index.html"):
            try:
                payload = HTML_FILE.read_bytes()
            except OSError:
                self.send_error(500, "index.html bulunamadi.")
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if self.path == "/scene.png":
            image_file = Path(__file__).with_name("scene.png")
            try:
                payload = image_file.read_bytes()
            except OSError:
                self.send_error(404, "scene.png bulunamadi.")
                return
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if self.path == "/istiklal_marsi.mp3":
            audio_file = Path(__file__).with_name("istiklal_marsi.mp3")
            try:
                payload = audio_file.read_bytes()
            except OSError:
                self.send_error(404, "istiklal_marsi.mp3 bulunamadi.")
                return
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        self.send_error(404)

    def log_message(self, fmt, *args):
        pass

if __name__ == "__main__":
    if not HTML_FILE.exists():
        raise SystemExit("index.html bu Python dosyasiyla ayni klasorde olmali.")
    threading.Thread(target=serial_reader, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", WEB_PORT), Handler)
    print(f"Tarayicida ac: http://127.0.0.1:{WEB_PORT}")
    print("Durdurmak icin Ctrl+C.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
