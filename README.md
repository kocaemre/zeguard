# 🛡️ ZeGuard — Gizli Prompt Injection Dedektörü

> PDF, DOCX ve PPTX dosyalarındaki gizli prompt injection tekniklerini tespit eden, tarayıcıda çalışan açık kaynak güvenlik aracı.
> Hiçbir veri sunucuya gönderilmez — tüm analiz client-side çalışır.

**Demo:** [docguard.zepatrol.xyz](https://docguard.zepatrol.xyz)

---

## 🎯 Ne Yapar?

AI sistemlerine dosya yüklediğinizde, belgede gizlenmiş talimatlar LLM'i manipüle edebilir. ZeGuard bu teknikleri otomatik olarak tespit eder.

### Tespit Edilen Saldırı Teknikleri

| Teknik | Açıklama |
|--------|----------|
| **Invisible Font** | Font rengi ≈ arka plan rengi (Delta-E ≤ 10) kontrolü |
| **Tiny Font** | 4pt altı metin — gözle görünmez, LLM okur |
| **Hidden Text** | DOCX `w:vanish` ve `w:webHidden` XML tag'leri |
| **Unicode Invisible** | 8 farklı invisible Unicode karakteri (özellikle 3+ ardışık) |
| **Metadata Injection** | `docProps/core.xml` ve `custom.xml` içinde injection pattern'ları |
| **Pattern Matching** | 50+ Türkçe ve İngilizce prompt injection pattern veritabanı |

---

## 🔒 Gizlilik

Tüm analiz **tarayıcıda** gerçekleşir. Dosyanız hiçbir sunucuya gönderilmez.

---

## 🛠️ Teknoloji

- **React 18** + TypeScript
- **Vite** — build tool
- **Tailwind CSS** — stil
- **pdf.js** — PDF parsing
- **mammoth.js** — DOCX parsing
- **PptxGenJS** — PPTX parsing

---

## 🚀 Kurulum

```bash
git clone https://github.com/kocaemre/zeguard.git
cd zeguard
npm install
npm run dev
```

### Build

```bash
npm run build
# dist/ klasörü oluşur, herhangi bir static hosting'e deploy edilebilir
```

---

## 📁 Proje Yapısı

```
zeguard/
├── src/
│   ├── analyzers/        # Analiz modülleri
│   │   ├── color-analyzer.ts     # Invisible font tespiti
│   │   ├── font-analyzer.ts      # Tiny font tespiti
│   │   ├── metadata-analyzer.ts  # Metadata injection
│   │   ├── pattern-analyzer.ts   # Pattern matching
│   │   └── unicode-analyzer.ts   # Invisible unicode
│   ├── parsers/          # Dosya ayrıştırıcıları
│   │   ├── pdf-parser.ts
│   │   ├── docx-parser.ts
│   │   └── pptx-parser.ts
│   ├── ui/               # React bileşenleri
│   │   ├── DropZone.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── FindingCard.tsx
│   │   ├── ScanProgress.tsx
│   │   └── AttacksPage.tsx
│   ├── patterns/
│   │   ├── tr.json       # Türkçe injection pattern'ları
│   │   └── en.json       # İngilizce injection pattern'ları
│   ├── reporter/
│   │   └── report-builder.ts
│   └── App.tsx
├── public/
├── index.html
└── vite.config.ts
```

---

## 👨‍💻 Geliştirici

**Emre Koca** — [0xemrek](https://github.com/kocaemre)

---

## 📄 Lisans

MIT
