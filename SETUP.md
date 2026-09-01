# Setup — von Null bis live (mit noindex)

Alles unten ist Copy-Paste. Was ich von dir brauche, steht in Schritt 2 und
Schritt 8.

**Verifiziert:** Das Bundle wurde in einem leeren Verzeichnis frisch
installiert und gebaut — `npm install`, `npm run build`, alle sieben Checks
grün, sowohl mit als auch ohne Inhalte. Zwei Tests prüften anfangs gegen
meine Beispieldaten und wären auf deinem frischen Klon rot gewesen; sie
überspringen diesen Abschnitt jetzt sauber.

---

## Schritt 1 — Voraussetzungen

```bash
node --version    # muss v20 oder höher sein, empfohlen v22
git --version
```

Konten, falls noch nicht vorhanden: GitHub und Netlify. **Beide legst du
selbst an** — Konten erstellen und Passwörter eingeben ist nichts, was ich
für dich tun kann oder sollte.

---

## Schritt 2 — Was ich von dir brauche

Vier Angaben, dann passe ich die Konfiguration für dich an:

1. **Domain** — z. B. `rockabilly-guide.de`. Falls noch keine: erst
   registrieren. Die Entscheidung ist teurer als sie aussieht, weil sie in
   jeder `@id` des Wissensgraphen steckt; ein späterer Wechsel bedeutet,
   alle Knoten-Anker zu ändern.
2. **Name der Site** — wie sie im Titel, im Feed und im JSON-LD heißt.
3. **Ein-Satz-Beschreibung** — sie landet als `description` auf der
   Startseite, in `llms.txt` und im Organization-Knoten.
4. **Autoren-Slug** — kleingeschrieben, ohne Umlaute, z. B. `markus`. Steht
   künftig unter jedem Eintrag.

Optional, kann auch später: GitHub-Nutzername (für die Repo-URL) und deine
Zeitzone, falls nicht `Europe/Berlin`.

---

## Schritt 3 — Projekt anlegen

Das Bundle entpacken oder kopieren, dann:

```bash
cd rockabilly-guide
npm install
npm run build          # muss durchlaufen
npm run verify         # Typen, Zeitzonen, Inhalte, JSON-LD, Tests, Build
```

Läuft beides grün, ist die Grundlage in Ordnung. Der Build erzeugt neun
Seiten — die Übersichten sind da, Inhalte noch nicht.

```bash
npm run dev            # http://localhost:4321
```

---

## Schritt 4 — Git und GitHub

```bash
git init
git add .
git commit -m "Grundgerüst: Datenvertrag, Prüfketten, Feeds, Layouts"
git branch -M main
```

Repo auf GitHub anlegen (Oberfläche oder `gh repo create`). **Privat oder
öffentlich?** Öffentlich hat für dieses Projekt Vorteile: Es macht die
Methodik nachprüfbar, was bei einem Register ein Vertrauenssignal ist, und
GitHub Actions sind für öffentliche Repos kostenlos. Dagegen spricht wenig —
Geheimnisse liegen keine im Repo.

```bash
git remote add origin git@github.com:DEIN-NAME/rockabilly-guide.git
git push -u origin main
```

**Branch-Schutz einrichten** (Settings → Branches → Add rule für `main`):

- „Require a pull request before merging"
- „Require status checks to pass" → nach dem ersten CI-Lauf den Check
  `verify` auswählen

Das ist kein Zierrat: Es ist die Bedingung dafür, dass agentische Workflows
später gefahrlos laufen können. Ein Agent, der auf `main` schreiben darf,
ist ein Agent ohne Netz.

---

## Schritt 5 — Netlify verbinden

1. Netlify → „Add new site" → „Import an existing project" → GitHub → Repo
   wählen.
2. Build-Einstellungen: **nichts eintippen.** `netlify.toml` liegt im Repo
   und setzt Build-Befehl (`npm run build`), Publish-Verzeichnis (`dist`),
   Node 22 und `PUBLIC_INDEXIERBAR=false`.
3. Deploy starten.

Netlify vergibt zunächst eine Adresse wie `zufallsname.netlify.app`. Das
reicht für den Anfang vollständig.

**Nach dem ersten Deploy prüfen:**

```
https://DEINE-SITE.netlify.app/robots.txt
```

Dort muss stehen:

```
# Aufbaumodus — die Site ist noch nicht freigegeben.
User-agent: *
Disallow: /
```

Und im Quelltext jeder Seite:

```html
<meta name="robots" content="noindex, follow">
```

Steht beides da, bist du live und unsichtbar — genau der gewünschte Zustand.

---

## Schritt 6 — Domain verbinden

In Netlify: „Domain management" → „Add a domain". Netlify nennt dir die
DNS-Einträge, die du beim Registrar setzt (entweder Netlify-Nameserver oder
ein `CNAME`/`ALIAS`). Das HTTPS-Zertifikat stellt Netlify danach automatisch
aus; das dauert nach der DNS-Umstellung wenige Minuten bis Stunden.

**Wichtig für die Reihenfolge:** `site.config.ts` muss dieselbe Domain
tragen wie die, die am Ende ausgeliefert wird — inklusive `www` oder ohne,
je nachdem, was du als Hauptdomain festlegst. Uneinheitlichkeit hier
erzeugt Canonicals und `@id`-Werte, die auf eine Weiterleitung zeigen.

---

## Schritt 7 — Die drei Workflows scharf schalten

Sie liegen bereits im Repo und starten von selbst:

| Workflow | Wann | Was |
|---|---|---|
| `ci.yml` | jeder Push und PR | `verify` mit `--strict`, Autolink-Drift |
| `pflege.yml` | montags 05:00 UTC | Termine archivieren, Autolinks → PR |
| `linkcheck.yml` | montags 06:00 UTC | Externe Links, Issue bei Funden |

Der Pflege-Workflow braucht eine Einstellung: Settings → Actions → General →
„Workflow permissions" → **Read and write** und „Allow GitHub Actions to
create and approve pull requests". Ohne das kann er keinen PR öffnen.

Beide geplanten Läufe kannst du zum Testen sofort von Hand starten
(Actions → Workflow wählen → „Run workflow").

---

## Schritt 8 — Was noch fehlt, bevor der Schalter umgelegt wird

Nicht für den Deploy nötig, aber vor `PUBLIC_INDEXIERBAR=true`:

- **Impressum** nach § 5 DDG und **Datenschutzerklärung**. Beides brauchst
  du inhaltlich selbst — ich kann Struktur und Formulierungen liefern, aber
  die Angaben sind deine. Sag Bescheid, dann bauen wir die Seiten.
- **Methodik-Seite**: Wie wird recherchiert und geprüft? Gibt es bezahlte
  Einträge? Die Seite wird selten gebaut und wirkt bei einem Register stark.
- **Analytics ohne Einwilligungsbanner** — Netlify Analytics (serverseitig,
  keine Cookies) oder Plausible. Ein Cookie-Banner auf einem Register kostet
  Nutzer und bringt nichts.
- **Inhalte** bis zur Startschwelle: rund 80 Veranstaltungen, 5 Regionen mit
  echter Einordnung, 80 Lexikonbegriffe, zwei Säulen vollständig.

Dann: Netlify → Site configuration → Environment variables →
`PUBLIC_INDEXIERBAR` auf `true`, neu deployen. Danach Sitemap in der Google
Search Console anmelden.

---

## Ein Hinweis zu den Beispieldaten

Die Golden Examples unter `src/content/*/_golden-example.md` enthalten
teilweise **erfundene Angaben** — Besetzungsnamen, Line-up-Einträge. Sie
zeigen die Form, nicht die Wahrheit. Der `_`-Präfix hält sie aus Build und
Validierung heraus; wenn du daraus echte Einträge machst, prüfe jedes Feld
gegen eine Quelle und trage sie in `quellen[]` ein.

Auch der Walldorf-Eintrag ist nur teilweise belegt. Verwende ihn als
Formvorlage, nicht als Datensatz.

---

## Wenn etwas klemmt

| Symptom | Ursache |
|---|---|
| Netlify-Build bricht bei `astro check` | `@astrojs/check`, `typescript` oder `@types/node` fehlen — sie stehen in `package.json`, also erst `npm ci` prüfen |
| `robots.txt` erlaubt alles, obwohl noindex gewollt | `PUBLIC_INDEXIERBAR` steht auf `true` oder wurde in der Netlify-Oberfläche gesetzt und übersteuert `netlify.toml` |
| `.ics` wird heruntergeladen statt abonniert | Header-Block aus `netlify.toml` greift nicht — bei Hosterwechsel dort neu setzen |
| CI rot bei „Autolink-Drift" | lokal `npm run autolink` laufen lassen und committen |
| Feeds leer | noch keine Inhalte mit `status: veroeffentlicht` |
