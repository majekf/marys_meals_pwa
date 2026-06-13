# Mary's Meals Slovakia – Sprievodca aplikáciou

Táto aplikácia je interaktívna edukatívna prezentácia určená na tablety, ktorá návštevníkom vysvetľuje poslanie a prácu organizácie Mary's Meals na Slovensku. Aplikácia má dva svety: jeden pre deti a jeden pre dospelých.

---

## Čo je v aplikácii

### 1. Úvodná obrazovka – výber režimu

Prvá vec, ktorú každý návštevník uvidí po spustení aplikácie, je **úvodná obrazovka s výberom režimu**. Zobrazuje logo Mary's Meals, názov organizácie a dve veľké tlačidlá:

- **„Pre deti"** – spustí hravý detský svet s hrami
- **„Pre dospelých"** – otvorí informačnú sekciu pre dospelých

> **Rodičovský zámok:** Tlačidlo „Pre dospelých" je chránené jednoduchým detským zámkom – návštevník ho musí **podržať 2 sekundy**, aby vstúpil do dospelej sekcie. Deti tak nemôžu náhodne prepnúť do dospelého obsahu.

Aplikácia sa automaticky vráti na túto obrazovku, ak sa nikto nedotkne tabletu **3 minúty** (ochrana pred zanechaním tabletu na nesprávnej obrazovke).

**Súbory v repozitári:**
- `src/screens/ModeSelect/ModeSelect.tsx` – logika a rozloženie obrazovky
- `src/screens/ModeSelect/ModeSelect.module.css` – vizuálny štýl
- `src/hooks/useIdleTimer.ts` – automatické vrátenie na úvodnú obrazovku po nečinnosti
- `public/config.json` – nastavenie časovačov (3 min nečinnosť, 2 s podržanie)

---

## Svet pre deti

Po kliknutí na „Pre deti" sa otvorí **menu hier**. Dieťa si vyberie jednu z dostupných hier. Každá hra učí niečo konkrétne o tom, ako Mary's Meals pomáha deťom vo svete.

**Súbory v repozitári:**
- `src/screens/GameMenu/GameMenu.tsx` – menu s výberom hier
- `src/screens/GameMenu/GameMenu.module.css` – vizuálny štýl menu

---

### Hra 1 – Miska jedla 🍲

Dieťa **ťahá ingrediencie** do misky a zostavuje „likuni phala" – výživnú kašu, ktorú Mary's Meals skutočne varí pre deti v Afrike. Ingrediencie sú: kukurica, sója, cukor a vitamíny.

- Každú ingredienciu treba presunúť prstom (alebo myšou) a pustiť ju do misky
- Po pridaní každej ingrediencie sa miska napĺňa
- Keď sú všetky štyri ingrediencie v miske, hra sa dokončí s gratulačnou správou

Hra učí deti, z čoho sa skladá obed, ktorý Mary's Meals varí.

**Súbory v repozitári:**
- `src/screens/BowlGame/BowlGame.tsx` – herná logika (ťahanie, kontrola dopadu do misky, dokončenie)
- `src/screens/BowlGame/BowlGame.module.css` – vizuálny štýl misky a ingrediencií

---

### Hra 2 – Kuchyňa 👨‍🍳

Dieťa **spáruje predmety s pomocníkmi** v kuchyni. Na obrazovke sú tri dobrovoľníci (kuchár, pomocník, nosič) a tri predmety (hrniec, naberačka, košík). Úlohou je priradiť každému pomocníkovi správny predmet.

- Najprv dieťa klikne na predmet (označí sa)
- Potom klikne na správneho pomocníka
- Ak je dvojica správna, spojenie sa potvrdí; ak nie, obrazovka upozorní na chybu

Hra učí, kto všetko sa podieľa na príprave jedla pre deti.

**Súbory v repozitári:**
- `src/screens/VolunteerKitchen/VolunteerKitchen.tsx` – herná logika (výber, párovanie, validácia)
- `src/screens/VolunteerKitchen/VolunteerKitchen.module.css` – vizuálny štýl

---

## Svet pre dospelých

Po podržaní tlačidla „Pre dospelých" (2 sekundy) sa otvorí **menu pre dospelých** so zoznamom informačných sekcií. Každá sekcia vysvetľuje iný aspekt práce Mary's Meals.

**Súbory v repozitári:**
- `src/screens/AdultsMenu/AdultsMenu.tsx` – menu s výberom sekcií
- `src/screens/AdultsMenu/AdultsMenu.module.css` – vizuálny štýl menu

---

### Sekcia 1 – 11 centov 💰

Táto sekcia vysvetľuje **silu malého príspevku**. Jeden obed pre dieťa v škole stojí len 11 centov (€0,11). Stránka obsahuje štyri fakty:

| Fakt | Čo hovorí |
|---|---|
| 🍽️ Jeden obed | Stačí 11 centov na výživný obed v škole |
| 📚 Vzdelanie | Stravovanie motivuje rodičov posielať deti do školy |
| 🌍 2,4 milióna detí | Mary's Meals denne nakŕmi viac ako 2,4 milióna detí v 18 krajinách |
| 💪 Dobrovoľníci | Vďaka dobrovoľníkom ide 93 % darov priamo deťom |

Na konci sekcie je odkaz na kalkulačku pomoci.

**Súbory v repozitári:**
- `src/screens/ElevenCents/ElevenCents.tsx` – obsah a rozloženie stránky
- `src/screens/ElevenCents/ElevenCents.module.css` – vizuálny štýl

---

### Sekcia 2 – Kalkulačka pomoci 🧮

Návštevník zadá **sumu**, ktorou by chcel prispieť, a aplikácia mu okamžite vypočíta:

- koľko obedov jeho príspevok zabezpečí
- koľko detí môže byť nakŕmených celý školský rok

Príklad: €10 = 90 obedov. €22 = 1 dieťa nakŕmené celý rok (200 školských dní).

Nachádza sa tu aj tlačidlo **„Prispieť"**, ktoré otvorí okno s QR kódom pre platbu (v MVP verzii je to zástupná ilustrácia – reálny QR kód bude doplnený pred nasadením).

**Súbory v repozitári:**
- `src/screens/DonationCalculator/DonationCalculator.tsx` – výpočtová logika, vstupné pole, QR okno
- `src/screens/DonationCalculator/DonationCalculator.module.css` – vizuálny štýl

---

### Sekcia 3 – Zapojte sa 🤝

Táto sekcia umožňuje návštevníkovi **zanechať kontakt** a vyjadriť záujem o spoluprácu. Na výber sú štyri spôsoby zapojenia:

| Možnosť | Popis |
|---|---|
| 🤝 Staň sa dobrovoľníkom | Pomoc pri organizovaní zbierok a podujatí |
| 💝 Pravidelný darca | Mesačný príspevok |
| 🏫 Školy a organizácie | Zapojenie školy alebo firmy |
| 📢 Šír povedomie | Odporučenie ďalším ľuďom |

Po výbere možnosti sa zobrazí **kontaktný formulár** s poliami pre meno a email (povinné) a správu (voliteľná). Po odoslaní sa formulár uloží lokálne v prehliadači (pripravený na synchronizáciu, keď je zariadenie online).

**Súbory v repozitári:**
- `src/screens/GetInvolved/GetInvolved.tsx` – logika formulára, validácia, ukladanie
- `src/screens/GetInvolved/GetInvolved.module.css` – vizuálny štýl

---

## Spoločné prvky celej aplikácie

### Navigačná lišta

Na každej podstránke (okrem úvodnej obrazovky) je viditeľná **navigačná lišta** s tlačidlami „Späť" a „Domov". Lišta sa farebne líši: v detskej sekcii je modrá, v dospelej sekcii biela.

**Súbory v repozitári:**
- `src/components/shared/Header/Header.tsx` – lišta, tlačidlá, navigácia
- `src/components/shared/Header/Header.module.css` – vizuálny štýl

---

### Spätná väzba (správa po akcii)

Po úspešnom dokončení hry alebo odoslaní formulára sa na obrazovke objaví **animovaná ikona** (zaškrtnutie/krížik) s krátkym textom. Táto správa automaticky zmizne po niekoľkých sekundách.

**Súbory v repozitári:**
- `src/components/shared/FeedbackOverlay/FeedbackOverlay.tsx` – overlay s animáciou
- `src/components/shared/FeedbackOverlay/FeedbackOverlay.module.css` – štýl

---

### Zvukové efekty

Aplikácia prehráva krátke zvukové efekty pri správnej odpovedi, chybe a dokončení hry. Zvuky je možné zapnúť alebo vypnúť v konfiguračnom súbore.

**Súbory v repozitári:**
- `src/hooks/useAudio.ts` – logika prehrávania zvukov
- `public/audio/sfx/` – priečinok pre zvukové súbory (success.mp3, error.mp3, complete.mp3)

---

### Konfigurácia – čo je zapnuté

Každá časť aplikácie je riadená **konfiguračným súborom**, ktorý určuje, čo je viditeľné a čo nie. Tým sa dá aplikácia prispôsobiť bez zmeny kódu – napríklad zapnúť sekciu, ktorá ešte nebola hotová, alebo vypnúť zvuky.

**Súbory v repozitári:**
- `public/config.json` – hlavný konfiguračný súbor (zápis áno/nie pre každú funkciu)
- `src/config/types.ts` – definícia štruktúry konfigurácie
- `src/config/useConfig.tsx` – načítanie konfigurácie v aplikácii

---

### Vizuálny štýl

Celá aplikácia používa farby a písmo organizácie Mary's Meals: modrá (#009ddc), oranžová (#f4a912), font Poppins. Všetky tlačidlá majú minimálnu výšku 48 px pre pohodlné dotykové ovládanie na tablete.

**Súbory v repozitári:**
- `src/styles/global.css` – farebná paleta, písmo, základné štýly celej aplikácie

---

### PWA – funguje offline

Aplikácia je navrhnutá ako **Progressive Web App (PWA)**: dá sa nainštalovať na tablet ako klasická appka a funguje aj bez internetového pripojenia. Pri prvom spustení si stiahne všetky potrebné súbory do pamäte.

**Súbory v repozitári:**
- `public/manifest.webmanifest` – názov, ikony, farby pre inštaláciu
- `vite.config.ts` – konfigurácia service workera (Workbox)
- `netlify.toml` – nastavenie nasadenia na Netlify hosting

---

## Prehľad obrazoviek a súborov

| Obrazovka | Cesta v aplikácii | Hlavný súbor |
|---|---|---|
| Výber režimu | `/` | `src/screens/ModeSelect/ModeSelect.tsx` |
| Menu hier (deti) | `/kids` | `src/screens/GameMenu/GameMenu.tsx` |
| Miska jedla | `/kids/bowl` | `src/screens/BowlGame/BowlGame.tsx` |
| Kuchyňa | `/kids/kitchen` | `src/screens/VolunteerKitchen/VolunteerKitchen.tsx` |
| Menu (dospelí) | `/adults` | `src/screens/AdultsMenu/AdultsMenu.tsx` |
| 11 centov | `/adults/eleven-cents` | `src/screens/ElevenCents/ElevenCents.tsx` |
| Kalkulačka | `/adults/calculator` | `src/screens/DonationCalculator/DonationCalculator.tsx` |
| Zapojte sa | `/adults/get-involved` | `src/screens/GetInvolved/GetInvolved.tsx` |

---

## Čo bude pridané v budúcich verziách

Nasledujúce časti sú pripravené v konfigurácii, ale ich obsah ešte nie je implementovaný:

- **Mapa sveta** (`/kids/map`) – interaktívna mapa s krajinami, kde Mary's Meals pôsobí
- **Školský zvonček** (`/kids/bell`) – hra, kde dieťa sprevádza postavu cestou do školy
- **Školské stravovanie** (`/adults/school-feeding`) – podrobný popis programu
- **Príbehy** (`/adults/stories`) – skutočné príbehy detí

Tieto sekcie sa dajú zapnúť v súbore `public/config.json` hneď, ako bude ich obsah hotový.
