# KX-Bridge (Testing)

Dieses Add-on betreibt die [KX-Bridge](https://gitea.it-drui.de/viewit/KX-Bridge-Release)
(Anycubic Kobra X – Moonraker Bridge für OrcaSlicer) unter Home Assistant. Es
verwendet das Testing-Image `gitea.it-drui.de/viewit/kx-bridge:testing` aus
[Issue #107](https://gitea.it-drui.de/viewit/KX-Bridge-Release/issues/107).

## Einrichtung

1. Add-on installieren und starten.
2. **Benutzeroberfläche öffnen** (Ingress) oder „In Seitenleiste anzeigen“
   aktivieren. Die UI ist weiterhin auch direkt unter
   `http://<home-assistant-ip>:7125` erreichbar.
3. Drucker über *„+ Add printer“* mit seiner IP-Adresse hinzufügen. Jeder weitere
   Drucker bekommt einen eigenen Port (7126–7130).
4. In OrcaSlicer als Host `<home-assistant-ip>:7125` eintragen, Host Type
   *Moonraker*. OrcaSlicer braucht immer den direkten Port, nicht Ingress.

Die gesamte Konfiguration erfolgt in der Web-UI der Bridge. „Save & Restart“
funktioniert wie gewohnt, das Add-on startet die Bridge selbst neu.

## Ingress

Die UI der Bridge läuft über einen kleinen nginx-Proxy im Add-on in der
Home-Assistant-Oberfläche, inklusive Log-Stream, Kamera und Upload. Bei
mehreren Druckern werden die weiteren Instanzen (Ports 7126–7130) ebenfalls über
Ingress durchgereicht, der Drucker-Wechsel in der UI funktioniert also auch dort.

Der Proxy schreibt die Adressen der UI zur Laufzeit um. Sollte nach einem neuen
Testing-Build etwas in der Ingress-Ansicht nicht laden, funktioniert die UI
weiterhin über den direkten Port 7125.

## Optionen

| Option | Beschreibung |
| --- | --- |
| `bridge_host_ip` | Optional. LAN-IP des Home-Assistant-Hosts, damit die Bridge im Log ihre korrekte Adresse anzeigt. |

## Daten

Konfiguration (`config.ini`, eigene Plugins) und Laufzeitdaten liegen im
Add-on-Volume unter `/data/config` und `/data/data`. Sie überstehen Neustarts,
Neuaufbau und Updates und sind in Home-Assistant-Backups enthalten.

## Neuen Testing-Build holen

`:testing` ist ein beweglicher Tag. Um den aktuellen Build zu laden: Add-on
öffnen → Menü (⋮) → **Neu aufbauen**. Die Version in der Bridge-UI zeigt danach
den neuen Build (z. B. `testing-fd86d71`).

## Bekanntes OrcaSlicer-2.5-Problem

Unverändertes OrcaSlicer 2.5 kann den Port eines gespeicherten Moonraker-Druckers
verlieren und Port 80 statt 7125 ansprechen. Abhilfe: in `OrcaSlicer.conf` unter
`local_machines` den Eintrag `"dev_ip"` auf `<home-assistant-ip>:7125` setzen.
Details stehen in Issue #107.
