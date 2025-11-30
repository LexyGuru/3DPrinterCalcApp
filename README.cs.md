# 🖨️ 3D Printer Calculator App

> **🌍 Výběr jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Moderní desktopová aplikace pro výpočet nákladů na 3D tisk. Vytvořeno pomocí Tauri v2, React frontendu a Rust backendu.

## ✨ Funkce

- 📊 **Výpočet nákladů** - Automatický výpočet nákladů na filament, elektřinu, sušení a opotřebení
- 🧵 **Správa filamentů** - Přidávání, úprava, mazání filamentů (značka, typ, barva, cena)
- 🖨️ **Správa tiskáren** - Správa tiskáren a systémů AMS
- 💰 **Výpočet zisku** - Volitelný procentuální zisk (10%, 20%, 30%, 40%, 50%)
- 📄 **Nabídky** - Ukládání, správa a export PDF nabídek (jméno zákazníka, kontakt, popis)
- 🧠 **Předvolby filtrů** - Ukládání filtrů nabídek, aplikace rychlých předvoleb, automatické filtry založené na datum/čas
- 🗂️ **Dashboard stavu** - Karty stavu, rychlé filtry a časová osa nedávných změn stavu
- 📝 **Poznámky ke stavu** - Každá změna stavu s volitelnými poznámkami a protokolováním historie
- 👁️ **Náhled PDF a šablony** - Vestavěný náhled PDF, volitelné šablony a bloky firemního brandingu
- 🎨 **Knihovna barev filamentu** - Více než 12,000 továrních barev s volitelnými panely založenými na značce a typu
- 💾 **Editor knihovny filamentů** - Přidávání/úprava založená na modalu, varování před duplikáty a trvalé ukládání do `filamentLibrary.json`
- 🖼️ **Obrázky filamentů v PDF** - Zobrazení log filamentů a vzorků barev v generovaných PDF
- 🧾 **Import G-code a vytváření konceptu** - Načítání exportů G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačce, s podrobným shrnutím a automatickým generováním konceptu nabídky
- 📈 **Statistiky** - Přehledný dashboard pro spotřebu filamentu, příjmy, zisk
- 🌍 **Vícejazyčnost** - Úplný překlad do maďarštiny, angličtiny, němčiny, francouzštiny, zjednodušené čínštiny, češtiny, španělštiny, italštiny, polštiny, portugalštiny, slovenštiny, ukrajinštiny a ruštiny (14 jazyků, 813 překladových klíčů na jazyk)
- 💱 **Více měn** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 měn)
- 🔄 **Automatické aktualizace** - Kontroluje GitHub Releases pro nové verze
- 🧪 **Beta verze** - Podpora beta větve a beta buildu
- ⚙️ **Kontrola beta** - Konfigurovatelná kontrola beta verzí
- 🎨 **Responzivní rozvržení** - Všechny prvky aplikace se dynamicky přizpůsobují velikosti okna
- ✅ **Potvrzovací dialogy** - Žádost o potvrzení před smazáním
- 🔔 **Toast notifikace** - Notifikace po úspěšných operacích
- 🔍 **Vyhledávání a filtrování** - Vyhledávání filamentů, tiskáren a nabídek
- 🔎 **Online porovnání cen** - Jedním kliknutím otevře výsledky vyhledávání Google/Bing pro vybraný filament, cena okamžitě aktualizovatelná
- 📋 **Duplikace** - Snadná duplikace nabídek
- 🖱️ **Drag & Drop** - Přeskupování nabídek, filamentů a tiskáren tažením
- 📱 **Kontextová menu** - Menu pravého tlačítka pro rychlé akce (upravit, smazat, duplikovat, exportovat)

## 🌿 Struktura větví

- **`main`**: Stabilní verze vydání (RELEASE build)
- **`beta`**: Beta verze a vývoj (BETA build)

Při pushování do větve `beta` se automaticky spustí workflow GitHub Actions, který sestaví beta verzi.

## 📋 Historie verzí

For detailed version history and changelog, please see [RELEASE.cs.md](RELEASE.cs.md).

---

**Verze**: 1.6.0

Pokud máte nějaké dotazy nebo najdete chybu, prosím otevřete issue v repozitáři GitHub!

