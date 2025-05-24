# Formular 230 IVI - Tax Redirection Platform

Platformă pentru redirecționarea a 3.5% din impozitul pe venit către Asociația "Inițiativa Vâlcea Inovează".

## ⚠️ IMPORTANT - CONFIGURARE GITHUB

### 1. Creează un GitHub Personal Access Token

1. Mergi la GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Setează:
   - **Note:** `Formular 230 IVI`
   - **Expiration:** `No expiration`
   - **Scopes:** Bifează `repo` (Full control of private repositories)
4. Copiază token-ul generat

### 2. Configurează Environment Variables

Creează fișierul `.env.local` în root-ul proiectului:

\`\`\`env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
\`\`\`

### 3. Pentru Vercel Deploy

În Vercel Dashboard → Settings → Environment Variables, adaugă:
- `GITHUB_TOKEN`: token-ul tău GitHub
- `GITHUB_OWNER`: username-ul tău GitHub  
- `GITHUB_REPO`: numele repository-ului

## Funcționalități

- ✅ Formular complet pentru redirecționarea impozitului
- ✅ Validare completă a datelor
- ✅ Semnătură digitală cu canvas
- ✅ Opțiune de împuternicire
- ✅ Generare PDF automat
- ✅ Panou de administrare
- ✅ Stocare securizată în GitHub
- ✅ Descărcare bulk PDF

## Tehnologii folosite

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **jsPDF** - PDF generation
- **GitHub API** - Data storage

## Instalare și configurare

### 1. Clonează repository-ul

\`\`\`bash
git clone <repository-url>
cd formular-230-ivi
\`\`\`

### 2. Instalează dependențele

\`\`\`bash
npm install
\`\`\`

### 3. Configurează Environment Variables

Creează fișierul `.env.local` în root-ul proiectului conform secțiunii "⚠️ IMPORTANT - CONFIGURARE GITHUB".

### 4. Rulează aplicația local

\`\`\`bash
npm run dev
\`\`\`

Aplicația va fi disponibilă la `http://localhost:3000`

## Deploy pe Vercel

### 1. Pregătire pentru deploy

\`\`\`bash
npm run build
\`\`\`

### 2. Deploy pe Vercel

#### Opțiunea A: Vercel CLI
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

#### Opțiunea B: GitHub Integration
1. Urcă codul pe GitHub
2. Conectează repository-ul la Vercel
3. Deploy automat

### 3. Configurează Environment Variables în Vercel

Adaugă variabilele de environment conform secțiunii "⚠️ IMPORTANT - CONFIGURARE GITHUB" în Vercel Dashboard.

## Utilizare

### Pentru utilizatori
1. Accesează site-ul
2. Completează formularul cu datele personale
3. Semnează digital
4. Trimite formularul

### Pentru administratori
1. Accesează `/admin`
2. Autentifică-te cu parola (default: "1234" sau master: "6942")
3. Vezi toate formularele trimise
4. Descarcă PDF-uri individual sau bulk
5. Modifică setările admin

## Securitate

- ✅ Parola master "6942" funcționează mereu
- ✅ Parolele sunt stocate securizat în GitHub
- ✅ Repository privat pentru date
- ✅ Validare completă pe frontend și backend

## Configurare GitHub

Pentru a configura GitHub, asigură-te că ai setat corect variabilele de environment `GITHUB_TOKEN`, `GITHUB_OWNER` și `GITHUB_REPO`.

## Structura proiectului

\`\`\`
├── app/
│   ├── actions.ts          # Server actions
│   ├── admin/              # Admin pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── admin-dashboard.tsx # Admin dashboard
│   ├── admin-login.tsx     # Admin login
│   ├── signature-canvas.tsx # Signature component
│   └── tax-redirection-form.tsx # Main form
├── lib/
│   ├── github-storage.ts   # GitHub API integration
│   ├── pdf-generator.ts    # PDF generation
│   └── utils.ts           # Utilities
└── public/
    └── logo.svg           # Logo
\`\`\`

## Debugging GitHub Connection

Toate operațiunile GitHub au logging extins. Verifică console-ul pentru:
- `=== INITIALIZING GITHUB STORAGE ===`
- `=== SAVING FORM TO GITHUB ===`
- `=== GETTING FORMS FROM GITHUB ===`

## Suport

Pentru probleme sau întrebări, contactează echipa de dezvoltare.
