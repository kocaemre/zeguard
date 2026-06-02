# ZeGuard

Gizli prompt injection dedektörü. PDF, DOCX ve PPTX dosyalarına gömülmüş gizli prompt injection tekniklerini tespit eden, tamamen tarayıcıda çalışan açık kaynak güvenlik aracı.

Tüm analiz client-side gerçekleşir; hiçbir veri sunucuya gönderilmez.

**Demo:** ~~docguard.zepatrol.xyz~~ — şu an yayında değil. Aşağıdaki [kurulum](#kurulum) adımlarıyla projeyi lokalde kolayca çalıştırabilirsiniz.

<img width="1920" height="961" alt="ZeGuard arayüzü" src="https://github.com/user-attachments/assets/f3e2838e-ab01-416f-9ff0-ff577ba42c3e" />

## Ne Yapar?

AI sistemlerine dosya yüklediğinizde, belgeye gizlenmiş talimatlar LLM'i manipüle edebilir. ZeGuard bu teknikleri otomatik olarak tespit eder.

### Tespit Edilen Saldırı Teknikleri

| Teknik | Açıklama |
|--------|----------|
| Invisible Font | Font rengi ≈ arka plan rengi (Delta-E ≤ 10) kontrolü |
| Tiny Font | 4pt altı metin — gözle görünmez, LLM okur |
| Hidden Text | DOCX `w:vanish` ve `w:webHidden` XML tag'leri |
| Unicode Invisible | 8 farklı görünmez Unicode karakteri (özellikle 3+ ardışık) |
| Metadata Injection | `docProps/core.xml` ve `custom.xml` içindeki injection pattern'ları |
| Pattern Matching | 50+ Türkçe ve İngilizce prompt injection pattern veritabanı |

## Gizlilik

Tüm analiz tarayıcıda gerçekleşir. Yüklediğiniz dosya hiçbir sunucuya gönderilmez.

## Teknoloji

- React 18 + TypeScript
- Vite — build tool
- Tailwind CSS — stil
- pdf.js — PDF parsing
- mammoth.js — DOCX parsing
- PptxGenJS — PPTX parsing

## Kurulum

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

## Proje Yapısı

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

## Geliştirici

Emre Koca — [0xemrek](https://github.com/kocaemre)

## Lisans

MIT
