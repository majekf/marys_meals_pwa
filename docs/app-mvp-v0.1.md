# Mary's Meals Slovakia – Sprievodca aplikáciou

Táto aplikácia je interaktívna edukatívna prezentácia určená na tablety, ktorá návštevníkom vysvetľuje poslanie a prácu organizácie Mary's Meals na Slovensku. Aplikácia má dva svety: jeden pre deti a jeden pre dospelých.

---

## Čo je v aplikácii

### 1. Úvodná obrazovka – výber režimu

Prvá vec, ktorú každý návštevník uvidí po spustení aplikácie, je **úvodná obrazovka s výberom režimu**. Zobrazuje logo Mary's Meals, názov organizácie a dve veľké tlačidlá:

- **„Pre deti"** – spustí hravý detský svet s hrami
- **„Pre zvedavých"** – otvorí informačnú sekciu pre dospelých

Aplikácia sa automaticky vráti na túto obrazovku, ak sa nikto nedotkne tabletu **3 minúty** (ochrana pred zanechaním tabletu na nesprávnej obrazovke).

**Súbory v repozitári:**
- `src/screens/ModeSelect/ModeSelect.tsx` – logika a rozloženie obrazovky
- `src/screens/ModeSelect/ModeSelect.module.css` – vizuálny štýl
- `src/hooks/useIdleTimer.ts` – automatické vrátenie na úvodnú obrazovku po nečinnosti
- `public/config.json` – nastavenie časovačov (3 min nečinnosť)

---

## Svet pre deti

Po kliknutí na „Pre deti" sa otvorí **menu hier**. Dieťa si vyberie jednu z dostupných hier. Každá hra učí niečo konkrétne o tom, ako Mary's Meals pomáha deťom vo svete.

**Súbory v repozitári:**
- `src/screens/GameMenu/GameMenu.tsx` – menu s výberom hier
- `src/screens/GameMenu/GameMenu.module.css` – vizuálny štýl menu
- `src/screens/GameMenu/gamesData.ts` – zoznam všetkých hier s konfiguračnými kľúčmi (zdieľané s navigačným hookom)

---

### Hra 1 – Miska nádeje 🍲

Dieťa pripravuje **likuni phala** – výživnú kašu, ktorú Mary's Meals varí pre deti v Afrike. Úlohou je naskladať správnu kombináciu surovín v správnom množstve.

**Správne suroviny (koľko lyžičiek treba):**
| Surovina | Počet | Vizuál |
|---|---|---|
| 🌽 Kukuričná kaša | 7 lyžičiek | žltá |
| 🫘 Sója | 2 lyžičky | hnedá |
| 🍯 Cukor | 1 lyžička | svetložltá |
| ⭐ Vitamíny | 1 hviezdička | zelená |

**Nesprávne suroviny (lákavé, ale nepatria do kaše):**
Cola 🥤, Čipsy 🍟, Lízanka 🍭, Burger 🍔, Čokoláda 🍫, Zmrzlina 🍦, Kečup 🍅, Cukríky 🍬

- Dieťa ťahá jednotlivé suroviny do misky (rozmiestnené organicky v elipse okolo misky)
- Pri každom ťahu sa pridá jedna jednotka danej suroviny
- Progres sa zobrazuje **vizuálne** pomocou ikon priamo v miske aj **číselne** ako `X/Y` pod miskou
- Na začiatku hry sa zobrazí hint „Potiahni správne suroviny do misky" (zmizne po 1,5 s); po 3 správnych prihodeniach sa raz zobrazí hint „Niektoré suroviny treba viac-krát."
- Ak dieťa pridá **nesprávnu surovinu**, zobrazí sa vtipná správa (napr. „Čokoláda je dobrota, ale deti potrebujú výživu! 🍫")
- Ak dieťa pridá **príliš veľa** správnej suroviny, zobrazí sa upozornenie (napr. „Ups, už je to príliš sladké! 🍯😋" pre cukor)
- Po správnom dokončení sa miska sfarbí nazeleno a zobrazí sa gratulačná správa
- Tlačidlo **„Hrať znova"** resetuje hru a vráti všetky suroviny na pôvodné miesta
- V navigačnej lište sú šípky **‹ / ›** na priame prechody medzi hrami bez návratu do menu

Hra učí deti, z čoho sa skladá obed, ktorý Mary's Meals varí, a podporuje pochopenie správneho pomeru surovín.

**Súbory v repozitári:**
- `src/screens/BowlGame/BowlGame.tsx` – herná logika (ťahanie, počítanie lyžičiek, validácia, chybové hlášky, dokončenie, reset)
- `src/screens/BowlGame/BowlGame.module.css` – vizuálny štýl misky, surovín a progress panelu

---

### Hra 2 – Kuchyňa dobrovoľníkov 👨‍🍳

Dieťa **spáruje predmety s postavami**. Na obrazovke je päť postáv a päť predmetov. Úlohou je priradiť každej postave správny predmet.

**Postavy a ich predmety:**
| Postava | Predmet |
|---|---|
| 🤝 Darca | 🪙 Minca |
| 👩‍🍳 Kuchárka | 🥄 Varecha |
| 👨‍🏫 Učiteľ | 📚 Kniha |
| 👨‍🌾 Farmár | 🌱 Semeno |
| 🧒 Dieťa | 🥣 Miska |

- Postavy aj predmety sú pri každej hre **náhodne zamiešané**
- Dieťa **ťahá predmet** na správnu postavu (drag-and-drop)
- Ak je priradenie správne, predmet zmizne a postava zobrazí odznak; ak nie, predmet sa vráti späť
- Postup zobrazuje počítadlo „X / Y priradených"
- Po správnom dokončení všetkých párov sa zobrazí gratulačná správa a tlačidlo **„Hrať znova"**

Hra učí, kto všetko sa podieľa na fungovaní Mary's Meals. V navigačnej lište sú šípky **‹ / ›** na priame prechody medzi hrami.

**Súbory v repozitári:**
- `src/screens/VolunteerKitchen/VolunteerKitchen.tsx` – herná logika (drag-and-drop párovanie, validácia, shuffle)
- `src/screens/VolunteerKitchen/VolunteerKitchen.module.css` – vizuálny štýl

---

## Svet pre dospelých

Po podržaní tlačidla „Pre zvedavých" (2 sekundy) sa otvorí **menu pre dospelých** so zoznamom informačných sekcií. Každá sekcia vysvetľuje iný aspekt práce Mary's Meals.

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
| 🌍 Viac ako 3 milióny detí | Mary's Meals denne nakŕmi viac ako 3 milióny detí v 16 krajinách |
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

Na obrazovkách hier (Miska nádeje, Kuchyňa dobrovoľníkov) sa navyše zobrazujú **šípky ‹ / ›** pre priamy prechod na predchádzajúcu alebo nasledujúcu hru – bez potreby vracať sa do menu hier. Zobrazí sa len šípka, ktorá má zmysel (napr. pri prvej hre len šípka doprava).

**Súbory v repozitári:**
- `src/components/shared/Header/Header.tsx` – lišta, tlačidlá, navigácia; prop `showGameNav` zapína šípky medzi hrami
- `src/components/shared/Header/Header.module.css` – vizuálny štýl
- `src/hooks/useGameNavigation.ts` – hook, ktorý určuje predchádzajúcu a nasledujúcu hru podľa aktuálnej URL a configu

---

### Spätná väzba (správa po akcii)

Po úspešnom dokončení hry alebo odoslaní formulára sa na obrazovke objaví **animovaná ikona** (zaškrtnutie/krížik) s krátkym textom. Táto správa automaticky zmizne po niekoľkých sekundách.

Farba ikony a textu pri úspechu je **biela** (na tmavom polopriesvitnom pozadí), čo zaručuje dobrú čitateľnosť na tyrkysovom aj oranžovom pozadí aplikácie.

**Súbory v repozitári:**
- `src/components/shared/FeedbackOverlay/FeedbackOverlay.tsx` – overlay s animáciou
- `src/components/shared/FeedbackOverlay/FeedbackOverlay.module.css` – štýl

---

### Zvukové efekty

Aplikácia prehráva krátke zvukové efekty pri správnej odpovedi, chybe a dokončení hry. Zvuky je možné zapnúť alebo vypnúť v konfiguračnom súbore.

**Súbory v repozitári:**
- `src/hooks/useAudio.ts` – logika prehrávania zvukov
- `src/hooks/useGameNavigation.ts` – navigácia medzi hrami (prev/next) na obrazovkách hier
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
| Miska nádeje | `/kids/bowl` | `src/screens/BowlGame/BowlGame.tsx` |
| Kuchyňa dobrovoľníkov | `/kids/kitchen` | `src/screens/VolunteerKitchen/VolunteerKitchen.tsx` |
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
