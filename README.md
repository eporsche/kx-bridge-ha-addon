# KX-Bridge Home Assistant Add-on

Home-Assistant-Add-on für die [KX-Bridge](https://gitea.it-drui.de/viewit/KX-Bridge-Release)
(Anycubic Kobra X – Moonraker Bridge für OrcaSlicer). Es verwendet das
Image `gitea.it-drui.de/viewit/kx-bridge:1.0.0-rc1`.

Dies ist ein Community-Wrapper und kein offizielles Projekt der KX-Bridge.

## Installation

[![Repository zu Home Assistant hinzufügen](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Feporsche%2Fkx-bridge-ha-addon)

Oder manuell:

1. **Einstellungen → Add-ons → Add-on Store → ⋮ → Repositories**
2. `https://github.com/eporsche/kx-bridge-ha-addon` hinzufügen
3. **KX-Bridge** installieren und starten
4. Benutzeroberfläche über Home Assistant (Ingress) oder direkt unter
   `http://<home-assistant-ip>:7125` öffnen und den Drucker hinzufügen

Weitere Hinweise: [kx-bridge/DOCS.md](kx-bridge/DOCS.md)

## Unterstützte Architekturen

`amd64`, `aarch64`
