# Joacă și Învață

Jocuri educative în limba română pentru copii de 2–5 ani. Web-first (PWA),
pregătit să fie împachetat ca aplicație nativă iOS/Android cu Capacitor.

## Jocuri incluse

1. **Culori** — atinge culoarea cerută
2. **Numărăm** — numără obiectele și atinge numărul corect
3. **Forme** — găsește forma cerută (cerc, pătrat, triunghi, stea, inima)
4. **Animale** — cine face sunetul? atinge animalul potrivit
5. **Memorie** — găsește perechile

Toate instrucțiunile sunt rostite în română (Web Speech API), așa că cei mici
se pot juca și fără să știe să citească.

## Dezvoltare

```bash
npm install
npm run dev        # server local, deschide pe http://localhost:5173
npm run build      # verifică tipurile + build de producție în dist/
npm run preview    # servește build-ul (folosește --host pentru a testa pe o tabletă din rețea)
```

## Testat pe o tabletă

`npm run preview -- --host`, apoi deschide adresa din rețea pe tabletă. În
Chrome/Safari poți „Adaugă pe ecranul principal" — se instalează ca aplicație.

## Pasul următor: aplicație nativă

Build-ul este 100% static (`base: './'`), deci se împachetează direct:

```bash
npm i -D @capacitor/cli @capacitor/core
npx cap init "Joaca si Invata" tech.example.joaca --web-dir=dist
npm i @capacitor/ios @capacitor/android
npm run build && npx cap add ios && npx cap add android
npx cap open ios   # sau android
```

## De unde pornești când vrei să extinzi

- Conținutul (culori, animale, forme, emoji) trăiește în `src/data/content.ts`.
- Cele patru jocuri de tip „alege corect" folosesc motorul comun
  `src/components/PickGame.tsx` — ca să adaugi un joc nou, dă-i un `makeRound()`.
- Emoji-urile sunt plaseholdere gratuite; înlocuiește-le cu ilustrații proprii
  când vrei un aspect unic.
