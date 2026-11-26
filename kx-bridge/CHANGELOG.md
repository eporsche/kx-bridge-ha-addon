# Changelog

## 0.3.0

- Basis-Image von `kx-bridge:testing` auf das Release `kx-bridge:1.0.0-rc1`
  umgestellt (fester Tag statt beweglichem Testing-Build)

## 0.2.1

- Ingress: Kamera-Stream wird beim Kaltstart bis zu viermal angefragt, statt
  nach 5 Sekunden mit „Stream nicht verfügbar“ abzubrechen

## 0.2.0

- Web-UI über Home-Assistant-Ingress (Seitenleiste), auch für mehrere Drucker
- Die direkten Ports 7125–7130 bleiben für OrcaSlicer unverändert

## 0.1.0

- Erste Version: Wrapper um `gitea.it-drui.de/viewit/kx-bridge:testing`
- Konfiguration und Daten persistent unter `/data`
- „Save & Restart“ der Bridge-UI startet die Bridge innerhalb des Add-ons neu
