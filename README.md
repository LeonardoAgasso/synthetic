# Synthetic

Registro pubblico, con fonti, dei brand che hanno dichiarato di usare modelle e modelli generati con l’AI nella loro pubblicità. Elenca anche i brand che si sono impegnati a non farlo.

È un sito statico pensato per GitHub Pages: niente build, niente dipendenze, niente cookie. Interfaccia in italiano e inglese.

```
synthetic/
├── index.html               Pagina principale (registro, filtri, ricerca)
├── metodo.html              Come funziona: criteri, correzioni, privacy
├── data/
│   └── brands.json          I dati: è l'unico file da modificare per aggiungere casi
├── assets/
│   ├── config.js            Indirizzo del repo, modulo esterno, email
│   ├── common.js            Traduzioni IT/EN e collegamenti
│   ├── app.js               Filtri, elenco, esportazione CSV
│   ├── style.css
│   ├── favicon.svg
│   ├── og-image.png         Anteprima per i link condivisi su social e chat
│   └── fonts/               Font Archivo, ospitato in locale (licenza OFL)
├── scripts/
│   └── validate.py          Controlla che brands.json sia corretto
├── .github/
│   ├── ISSUE_TEMPLATE/      Moduli "Segnala un brand" e "Chiedi una correzione"
│   └── workflows/
│       └── validate.yml     Esegue il controllo dei dati a ogni push
└── .nojekyll
```

## Prima di pubblicare

1. **Sostituisci `TUO-UTENTE`** con il tuo username GitHub in `assets/config.js` e in `index.html` (nei tag `og:`). Se chiami il repository in modo diverso da `synthetic`, cambia anche quello.
2. **Ricontrolla le fonti dei casi iniziali.** Le voci di `data/brands.json` sono state compilate da articoli di stampa: apri ogni link e verifica che dica davvero quello che riporta la voce. Alcuni articoli potrebbero essere dietro paywall o non più online. È il passaggio più importante, perché un’attribuzione sbagliata è il rischio principale di un progetto così.
3. Facoltativo: scegli una licenza. Una combinazione comune è MIT per il codice e CC BY 4.0 per i dati, così giornalisti e ricercatori sanno come possono riusarli.

## Provarlo in locale

Il sito carica `data/brands.json`, e i browser bloccano questo caricamento se apri `index.html` con un doppio clic. Serve un piccolo server locale:

```bash
cd synthetic
python3 -m http.server 8000
```

Poi apri <http://localhost:8000>. In alternativa, con Node.js: `npx serve`.

## Pubblicarlo su GitHub Pages

1. Crea un repository **pubblico** e vuoto su <https://github.com/new> (senza README, senza licenza).
2. Dalla cartella del progetto:

   ```bash
   git init
   git add .
   git commit -m "Prima versione"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/synthetic.git
   git push -u origin main
   ```

   Con la GitHub CLI basta: `gh repo create synthetic --public --source=. --push`

3. Nel repository vai su **Settings → Pages**. In "Build and deployment" scegli **Deploy from a branch**, poi branch `main` e cartella `/ (root)`, e salva.
4. Dopo un paio di minuti il sito è online su `https://TUO-UTENTE.github.io/synthetic/`.
5. Vai su **Issues → Labels** e crea le etichette `segnalazione` e `correzione`: i moduli le usano, ma GitHub le applica solo se esistono già.

## Aggiungere un caso

Aggiungi un oggetto all’elenco `entries` in `data/brands.json` e aggiorna la data `updated` in cima al file.

| Campo | Cosa contiene |
|---|---|
| `id` | Identificativo unico, minuscole e trattini: `guess-2025-vogue` |
| `brand` | Nome del brand |
| `category` | `ai` (usa modelli AI) oppure `no-ai` (si è impegnato a non usarli) |
| `sector` | `fashion`, `ecommerce`, `food`, `beauty`, `tech`, `auto`, `other` |
| `country` | Codice di due lettere del paese del brand: `IT`, `US`, `DE`… |
| `date` | Quando è uscito o è stato dichiarato: `2025`, `2025-08` o `2025-08-14` |
| `uses` | Uno o più tra `campaign`, `social`, `ecommerce`, `video`, `digital-twins`, `virtual-influencer`. Vuoto per i casi `no-ai` |
| `note` | Cosa è successo, con `it` ed `en`. Basta una lingua: il sito usa l’altra come riserva |
| `disclosure` | Come il brand lo ha dichiarato, con `it` ed `en` |
| `sources` | Una o più fonti: `{ "publisher": "...", "date": "...", "url": "https://..." }` |

Poi controlla i dati prima del push:

```bash
python3 scripts/validate.py
```

Lo stesso controllo parte in automatico su GitHub a ogni push che tocca `data/` (scheda **Actions**).

Per aggiungere un nuovo settore o un nuovo tipo di uso, aggiornalo sia in `scripts/validate.py` sia in `assets/common.js`, in entrambe le lingue.

## Gestire le segnalazioni

Le persone usano il pulsante "Segnala un brand", che apre un modulo già strutturato su GitHub. Un flusso semplice: verifichi la fonte, aggiungi la voce a `brands.json`, chiudi la segnalazione con il link al commit.

Chi non ha un account GitHub non può aprire segnalazioni. Se vuoi raccoglierle anche da loro, crea un Google Form e incolla il suo indirizzo in `reportFormUrl` dentro `assets/config.js`: i pulsanti "Segnala un brand" porteranno lì. Puoi anche indicare un `contactEmail` per le correzioni.

Ogni voce ha un link "Segnala un errore" che apre il modulo di correzione già compilato con il nome della voce.

## Condividerlo

- Per i gruppi internazionali, condividi il link con `?lang=en`: `https://TUO-UTENTE.github.io/synthetic/?lang=en`. Senza parametro, il sito sceglie la lingua in base al browser.
- L’immagine di anteprima (`assets/og-image.png`) è in italiano e non contiene numeri, quindi non va rifatta quando aggiungi casi.

## Privacy e note legali

- Il sito non usa cookie né strumenti di analisi. Il font è ospitato nel repository e non su Google Fonts, così gli indirizzi IP dei visitatori non vengono inviati a terzi. L’unica cosa salvata nel browser è la lingua scelta.
- GitHub Pages può registrare gli indirizzi IP dei visitatori per motivi di sicurezza: lo dice anche la pagina "Come funziona".
- Il font Archivo è distribuito con licenza SIL Open Font License (`assets/fonts/OFL.txt`).
- Le regole che proteggono il progetto sono già scritte in `metodo.html`: solo casi dichiarati o confermati, una fonte per ogni voce, nessuna immagine delle campagne, correzioni rapide e tracciate.
