# 🖨️ 3D Printer Calculator App

> **🌍 Výber jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Moderná desktopová aplikácia na výpočet nákladov na 3D tlač. Vytvorená pomocou Tauri v2, React frontendu a Rust backendu.

## ✨ Funkcie

- 📊 **Výpočet nákladov** - Automatický výpočet nákladov na filament, elektrinu, sušenie a opotrebenie
- 🧵 **Správa filamentov** - Pridávanie, úprava, mazanie filamentov (značka, typ, farba, cena)
- 🖨️ **Správa tlačiarní** - Správa tlačiarní a systémov AMS
- 💰 **Výpočet zisku** - Voliteľné percentuálne zisky (10%, 20%, 30%, 40%, 50%)
- 📄 **Ponuky** - Ukladanie, správa a export PDF ponúk (meno zákazníka, kontakt, popis)
- 🧠 **Predvolby filtrov** - Ukladanie filtrov ponúk, aplikácia rýchlych predvolieb, automatické filtre založené na dátum/čas
- 🗂️ **Dashboard stavu** - Karty stavu, rýchle filtre a časová osa nedávnych zmien stavu
- 📝 **Poznámky k stavu** - Každá zmena stavu s voliteľnými poznámkami a protokolovaním histórie
- 👁️ **Náhľad PDF a šablóny** - Vstavaný náhľad PDF, voliteľné šablóny a bloky firemného brandingu
- 🎨 **Knižnica farieb filamentu** - Viac ako 12,000 továrenských farieb s voliteľnými panelmi založenými na značke a type
- 💾 **Editor knižnice filamentov** - Pridávanie/úprava založená na modale, varovania pred duplikátmi a trvalé ukladanie do `filamentLibrary.json`
- 🖼️ **Obrázky filamentov v PDF** - Zobrazenie log filamentov a vzoriek farieb v generovaných PDF
- 🧾 **Import G-code a vytváranie konceptu** - Načítanie exportov G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačke, s podrobným zhrnutím a automatickým generovaním konceptu ponuky
- 📈 **Štatistiky** - Prehľadný dashboard pre spotrebu filamentu, príjmy, zisk
- 🌍 **Viacjazyčnosť** - Úplný preklad do maďarčiny, angličtiny, nemčiny, francúzštiny, zjednodušenej čínštiny, češtiny, španielčiny, taliančiny, poľštiny, portugalčiny, slovenčiny, ukrajinčiny a ruštiny (14 jazykov, 813 prekladových kľúčov na jazyk)
- 💱 **Viaceré meny** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 mien)
- 🔄 **Automatické aktualizácie** - Kontroluje GitHub Releases pre nové verzie
- 🧪 **Beta verzie** - Podpora beta vetvy a beta buildu
- ⚙️ **Kontrola beta** - Konfigurovateľná kontrola beta verzií
- 🎨 **Responzívne rozloženie** - Všetky prvky aplikácie sa dynamicky prispôsobujú veľkosti okna
- ✅ **Potvrdzovacie dialógy** - Žiadosť o potvrdenie pred vymazaním
- 🔔 **Toast notifikácie** - Notifikácie po úspešných operáciách
- 🔍 **Vyhľadávanie a filtrovanie** - Vyhľadávanie filamentov, tlačiarní a ponúk
- 🔎 **Online porovnanie cien** - Jedným kliknutím otvorí výsledky vyhľadávania Google/Bing pre vybraný filament, cena okamžite aktualizovateľná
- 📋 **Duplikácia** - Ľahká duplikácia ponúk
- 🖱️ **Drag & Drop** - Preskupovanie ponúk, filamentov a tlačiarní pretiahnutím
- 📱 **Kontextové menu** - Menu pravého tlačidla pre rýchle akcie (upraviť, vymazať, duplikovať, exportovať)

## 📸 Screenshoty

## 🌿 Štruktúra vetiev

- **`main`**: Stabilné verzie vydania (RELEASE build)
- **`beta`**: Beta verzie a vývoj (BETA build)

Pri pushovaní do vetvy `beta` sa automaticky spustí workflow GitHub Actions, ktorý zostaví beta verziu.

## 📋 História verzií

For detailed version history and changelog, please see [RELEASE.sk.md](RELEASE.sk.md).

---

**Verzia**: 1.6.0

Ak máte nejaké otázky alebo nájdete chybu, prosím otvorte issue v repozitári GitHub!

