# Arbeitsweise — von überall steuern, an einer Stelle arbeiten

Wie du dieses Projekt zwischen Mac mini, Browser, Handy und CI aufteilst.

---

## Die Ausgangsfrage, ehrlich beantwortet

Du willst, dass der Mac mini die eigentliche Arbeit macht und du von überall
Befehle gibst. Das ist machbar — aber für dieses Projekt ist es nicht die
beste Aufteilung, und der Grund ist ein struktureller:

> **Der Engpass ist nicht Rechenleistung, sondern wo der Zustand liegt. Und
> der liegt im Git-Repo, nicht auf dem Mac mini.**

Fast alles an diesem Projekt — Recherche, Content, Code, Tests, Build — ist
reine Repo-Arbeit. Dafür braucht es keinen bestimmten Rechner. Wenn du den
Mac mini trotzdem zum Zentrum machst, baust du dir einen Single Point of
Failure: Er schläft, das Netz fällt aus, macOS startet neu — und du bist
blockiert, obwohl die Arbeit nirgends daran hing.

Die tragfähigere Aufteilung nutzt drei Bahnen und ordnet jede Aufgabe
danach zu, **wo ihr Zustand liegt**.

---

## Die drei Bahnen

### Bahn 1 — Cloud-Sessions: der Standard

Claude Code on the web führt Aufgaben auf Anthropic-verwalteter
Cloud-Infrastruktur unter `claude.ai/code` aus; die Sessions laufen weiter,
auch wenn du den Browser schließt, und du kannst sie aus der Claude-App
verfolgen. Voraussetzung ist ein verbundenes GitHub-Konto — das hast du.

**Dafür nehmen:** Content-Recherche, Bandprofile, Lexikoneinträge, Refactorings,
neue Skripte, Fehlerbehebung. Alles, was nur das Repo braucht.

**Warum das die richtige Voreinstellung ist:** Du startest eine Aufgabe vom
Handy in der Bahn, sie läuft weiter, während du das Handy wegsteckst, und du
siehst das Ergebnis als Pull Request. Der Mac mini muss dafür nicht einmal
eingeschaltet sein.

Deine auf claude.ai aktivierten Plugins werden in Cloud-Sessions
heruntergeladen und als `<name>@synced` geladen — deine Recherche-Skills
sind dort also verfügbar.

**Einmal einrichten:** `/web-setup` im Terminal. Danach kannst du
Cloud-Sessions auch aus dem Terminal mit `--cloud` starten und mit
`--teleport` ins Terminal zurückholen.

**Ein Punkt zum Prüfen:** Cloud-Umgebungen haben konfigurierbare
Netzzugriffs-Stufen. Deine Recherche-Skills brauchen Websuche und
Seitenabrufe — stell sicher, dass die Umgebung das darf, sonst scheitern
Discovery-Läufe stumm.

### Bahn 2 — Remote Control auf dem Mac mini: wenn lokaler Zustand zählt

Remote Control verbindet `claude.ai/code` oder die Claude-App mit einer
Session, die **auf deinem Rechner** läuft. Dateisystem, MCP-Server, Tools
und Projektkonfiguration bleiben lokal verfügbar; Web und App sind nur ein
Fenster in diese Session. Die Verbindung läuft ausschließlich ausgehend über
HTTPS — es wird kein Port auf dem Mac mini geöffnet.

**Dafür nehmen:**

- Netlify-CLI, Deploys, alles mit Zugangsdaten
- lange Crawls über Veranstalter-Websites
- `npm run dev` mit Vorschau im Browser
- MCP-Server, die du lokal betreibst
- alles, wo du den echten Arbeitsstand sehen willst, bevor er ins Repo geht

**Der entscheidende Startbefehl** (mehr dazu unten):

```bash
claude remote-control --spawn worktree --name "Rockabilly-Guide"
```

`--spawn worktree` gibt jeder neu geöffneten Session einen eigenen
Git-Worktree. Ohne diese Option teilen sich alle Sessions dasselbe
Arbeitsverzeichnis und geraten sich beim Bearbeiten derselben Dateien in die
Quere — genau das Szenario, wenn du vom Handy eine zweite Aufgabe anstößt,
während am Schreibtisch noch eine läuft.

### Bahn 3 — GitHub Actions: alles Wiederkehrende und Deterministische

Läuft bereits: `ci.yml` bei jedem Push, `pflege.yml` und `linkcheck.yml`
wöchentlich.

**Die Regel dazu ist wichtiger als die Technik:** Was ein Skript zuverlässig
kann, bekommt kein Modell. Termine archivieren, Autolinks setzen, Links
prüfen, Berichte erzeugen — das sind Actions, keine Agenten. Es kostet
nichts, scheitert nie an Kontext und ist im Diff vollständig nachvollziehbar.

Claude Code kann zwar auch geplante Aufgaben ausführen — über CLI, Desktop
oder Cloud. Nimm das nur für Läufe, die tatsächlich Urteilsvermögen
brauchen, etwa den wöchentlichen Discovery-Lauf über Veranstalter-Websites.

---

## Die Zuordnungsregel

| Aufgabe | Bahn |
|---|---|
| Event recherchieren und anlegen | Cloud-Session |
| Bandprofil schreiben | Cloud-Session oder Cowork |
| Lexikon erweitern | Cloud-Session |
| Neues Skript, Refactoring, Fehlerbehebung | Cloud-Session |
| Gestaltung einspielen und im Browser prüfen | Mac mini (Remote Control) |
| Netlify-Deploy von Hand, Domainumzug | Mac mini |
| Discovery-Crawl über 40 Veranstalterseiten | Mac mini |
| Plugin installieren oder aktualisieren | Mac mini (lokal-only) |
| Termine archivieren, Autolinks, Linkcheck | GitHub Actions |
| Freigabe von Entwürfen | Du, gebündelt, wo auch immer |
| Strategie, Themenkarte, Prompt-Map | Claude-Chat (dieses Fenster) |

Zwei Befehle laufen ausschließlich im lokalen Terminal, nicht von Handy oder
Web: `/plugin` und `/resume`. Plugin-Verwaltung ist damit Mac-mini-Arbeit.

---

## Einrichtung auf dem Mac mini

### Dauerhaft laufen lassen

Der lokale Prozess muss laufen, sonst geht die Session offline; für Rechner,
zu denen du dich per SSH verbindest, empfiehlt die Dokumentation
ausdrücklich `tmux` oder `screen`.

```bash
brew install tmux
tmux new -s rockabilly
cd ~/projekte/rockabilly-guide
claude remote-control --spawn worktree --name "Rockabilly-Guide"
# Ctrl-b d löst ab, die Session läuft weiter
```

Zwei Dinge zusätzlich absichern:

- **Ruhezustand aus.** Systemeinstellungen → Batterie/Energie → „Automatischen
  Ruhezustand deaktivieren". Ein schlafender Mac mini ist ein offline
  Mac mini.
- **Neustart überstehen.** Ein `launchd`-Job, der die tmux-Session beim
  Anmelden wieder aufbaut. Bei längerem Netzausfall beendet sich der Server
  nach rund zehn Minuten von selbst — ein Wrapper, der ihn neu startet,
  spart dir den Weg zum Gerät.

### Benachrichtigungen aufs Handy

Im Terminal `/config`, dann **Push when Claude decides** und **Push when
actions required** einschalten. Damit meldet sich die App, wenn ein langer
Lauf fertig ist oder eine Freigabe ansteht — das ist der Unterschied
zwischen „ich schaue alle zwanzig Minuten nach" und „ich werde gerufen".

`/mobile` im Terminal zeigt einen QR-Code für die App-Installation.

### Berechtigungen — und warum unsere Hooks hier zahlen

Die Versuchung ist `--dangerously-skip-permissions`, damit ein Lauf nicht
alle zwei Minuten nachfragt. Das ist bei einem Rechner mit deinen
Zugangsdaten die falsche Abkürzung.

Der bessere Weg für dieses Projekt:

```bash
claude remote-control --spawn worktree --permission-mode acceptEdits
```

Dateiänderungen laufen durch, ohne dass du jede einzeln bestätigst — aber
die Grenzen setzt nicht mehr die Rückfrage, sondern der `PreToolUse`-Hook,
den wir gebaut haben: Schema, `site.config.ts`, `.claude/`, `.github/` und
jedes `status: veroeffentlicht` sind blockiert, egal was der Agent vorhat.
Genau dafür haben wir ihn gebaut, und genau hier zahlt er sich aus.

---

## Der typische Tag

**Morgens, Handy:** App öffnen → Code-Tab. Der Mac mini erscheint als
Gerätekarte; du kannst dort eine Session starten und ein Verzeichnis wählen.
Oder du startest eine Cloud-Session für etwas, das nur das Repo braucht.

„Leg die drei Festivals aus der Kandidatenliste als Entwürfe an."

**Unterwegs:** Push meldet sich, wenn Rückfragen kommen oder der Lauf fertig
ist. Antworten kannst du vom Handy; Bilder und Dateien lassen sich ebenfalls
anhängen.

**Abends, Browser auf einem anderen Rechner:** `claude.ai/code` öffnen,
dieselbe Session weiterführen. Terminal, Browser und Handy sind synchron —
du kannst von allen dreien abwechselnd schreiben.

**Freigabe:** `npm run stale` zeigt die Warteschlange. Gebündelt prüfen,
Status setzen, PR mergen, Netlify deployt.

---

## Was ich nicht empfehle

**Den Mac mini als einzige Bahn.** Du verlierst die Fähigkeit, Aufgaben
weiterlaufen zu lassen, wenn du das Gerät verlässt — Cloud-Sessions können
das, Remote Control nicht: Stoppt der lokale Prozess, ist die Session
offline.

**Parallele Sessions im selben Verzeichnis.** Ohne `--spawn worktree`
schreiben zwei Agenten in dieselben Dateien. Das merkst du erst am kaputten
Diff.

**Modelle für deterministische Arbeit.** Der wöchentliche Statusabgleich
läuft als GitHub Action in Sekunden und kostet nichts. Als Agent kostet er
Geld und kann scheitern.

**Direkt auf `main`.** Egal aus welcher Bahn: Branch, PR, CI, Merge. Das ist
die Bedingung dafür, dass die Bahnen sich nicht gegenseitig überschreiben.

---

## Nebenbei erwähnenswert

- **Cross-Session-Messaging:** Deine Sessions auf verschiedenen Maschinen
  und in der Cloud können einander Nachrichten schicken. Für später
  interessant, etwa wenn ein Cloud-Recherchelauf dem Mac mini meldet, dass
  neue Entwürfe zur Prüfung bereitliegen.
- **Channels:** Telegram oder Discord können Ereignisse in eine lokale
  Session schieben. Falls du irgendwann Meldungen aus der Szene direkt in
  eine Kandidatenliste kippen willst, ist das der Weg.
- **Dispatch:** Aufgabe aus der Handy-App an die Desktop-App schicken —
  einfacher einzurichten als Remote Control, wenn du ohnehin die Desktop-App
  auf dem Mac mini nutzt.

---

## Maximal in die Cloud: was danach noch übrig bleibt

Wenn du konsequent verlagerst, schrumpft die lokale Abhängigkeit auf einen
sehr kleinen Rest. Der Reihe nach, was jeweils den Mac mini ersetzt:

| Bisher lokal | Ersatz | Bemerkung |
|---|---|---|
| `npm run dev` zur Vorschau | **Netlify Deploy Previews** | Jeder PR bekommt eine eigene URL. Vom Handy prüfbar. |
| Deploys | Git-Push löst sie aus | Netlify-CLI wird nie gebraucht |
| Umgebungsvariablen, Domain, DNS | Netlify-Oberfläche | Browser genügt |
| Secrets | GitHub-Repository-Secrets | Browser genügt |
| Wiederkehrende Pflege | GitHub Actions | läuft bereits |
| Wiederkehrende Recherche | Geplante Aufgaben in der Cloud | Claude Code kann sie über CLI, Desktop **oder Cloud** ausführen |
| Plugins aktivieren | claude.ai-Konto | aktivierte Plugins werden in Cloud-Sessions als `@synced` geladen |
| Build- und Testläufe | Cloud-Session oder CI | identische Befehle |

**Der Vorschau-Punkt ist der wichtigste.** Deploy Previews nehmen dir den
letzten Grund, einen lokalen Dev-Server zu betreiben: Du bekommst zu jedem
Pull Request eine vollständige, gebaute Version der Site unter eigener URL —
inklusive Feeds, JSON-LD und Facettenseiten. Prüfen kannst du sie von jedem
Gerät.

### Die Falle, die genau dabei scharf wird

Deploy Previews erben die Build-Umgebung der Produktion. Sobald du nach dem
Go-Live `PUBLIC_INDEXIERBAR` auf `true` setzt, wäre **jede Vorschau ebenfalls
indexierbar** — dieselbe Site unter `xyz--deploy-preview-17.netlify.app`,
als Duplicate Content gegen die eigene Domain, erzeugt von der eigenen
Qualitätssicherung.

`netlify.toml` setzt den Schalter deshalb jetzt **je Kontext**:

```toml
[context.production.environment]
  PUBLIC_INDEXIERBAR = "false"   # diese Zeile ist der Go-Live

[context.deploy-preview.environment]
  PUBLIC_INDEXIERBAR = "false"   # dauerhaft, auch nach dem Go-Live

[context.branch-deploy.environment]
  PUBLIC_INDEXIERBAR = "false"
```

Gegengeprüft: Mit `true` liefert die Produktion die volle `robots.txt` mit
Crawler-Freigaben, mit `false` den Aufbaumodus mit `Disallow: /`. Vorschauen
bleiben damit unsichtbar, ohne dass jemand daran denken muss.

### Der unvermeidbare Rest

Vier Dinge bleiben an dir hängen, unabhängig von der Bahn:

1. **Konten und Zahlung** — GitHub, Netlify, Domain-Registrar.
2. **DNS** — einmalig beim Registrar, danach nie wieder.
3. **Freigaben** — der Kern der redaktionellen Verantwortung. Von jedem
   Gerät möglich, aber nicht delegierbar.
4. **Der Go-Live-Schalter** — eine Zeile in der Netlify-Oberfläche.

Alles andere kann in der Cloud passieren. Der Mac mini wird damit vom
Fundament zum Rückfallgerät: nützlich, wenn du etwas hartnäckig debuggen
willst oder einen langen Crawl ohne Cloud-Limits brauchst — aber nichts
steht still, wenn er aus ist.

### Was du dafür einrichten solltest

- **Cloud-Umgebung konfigurieren:** Cloud-Umgebungen erlauben
  Netzzugriffs-Stufen, Umgebungsvariablen und Setup-Skripte. Hinterlege
  `npm ci` als Setup-Skript, dann startet jede Session arbeitsbereit statt
  mit einer Minute Installation.
- **Netzzugriff prüfen:** Deine Recherche-Skills brauchen Websuche und
  Seitenabrufe. Ohne passende Stufe scheitern Discovery-Läufe stumm.
- **Deploy Previews einschalten** (Netlify: Standard für PRs) und die
  Vorschau-URL zur Gewohnheit machen: Kein Merge ohne einen Blick darauf.

## Wenn du es auf drei Zeilen eindampfen willst

1. **Cloud-Session** für alles, was nur das Repo braucht — also fast alles.
2. **GitHub Actions** für alles Wiederkehrende und Deterministische.
3. **Mac mini** als Rückfallgerät, nicht als Fundament.

Deine Hardware ist damit Komfort, keine Voraussetzung. Was bleibt, sind
Konten, DNS, Freigaben und ein Schalter.
