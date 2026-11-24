#!/bin/sh
# Startskript des Home-Assistant-Add-ons.
# - Persistenz: /app/config und /app/data zeigen auf das Add-on-Volume /data.
# - Neustart: Die Bridge beendet sich bei "Save & Restart" mit Exit-Code 0 und
#   erwartet einen Neustart durch Docker; hier übernimmt das die Schleife.
set -u

CONFIG_DIR=/data/config
DATA_DIR=/data/data

mkdir -p "$CONFIG_DIR/plugins" "$DATA_DIR"

# Verzeichnis aus dem Image durch einen Symlink auf das Volume ersetzen.
# Mitgelieferte Dateien (config.ini.example) werden übernommen, ohne
# vorhandene Dateien zu überschreiben.
link_dir() {
    src="$1"
    target="$2"
    if [ -d "$src" ] && [ ! -L "$src" ]; then
        cp -an "$src/." "$target/"
        rm -rf "$src"
    fi
    ln -sfn "$target" "$src"
}

link_dir /app/config "$CONFIG_DIR"
link_dir /app/data "$DATA_DIR"

export KX_DATA_DIR="$DATA_DIR"

HOST_IP="$(python -c 'import json; print(json.load(open("/data/options.json")).get("bridge_host_ip") or "")' 2>/dev/null)"
if [ -n "$HOST_IP" ]; then
    export BRIDGE_HOST_IP="$HOST_IP"
fi

cd /app || exit 1

child=""
stop() {
    if [ -n "$child" ]; then
        kill -TERM "$child" 2>/dev/null
        wait "$child" 2>/dev/null
    fi
    exit 0
}
trap stop TERM INT

while :; do
    python kobrax_moonraker_bridge.py "$@" &
    child=$!
    wait "$child"
    rc=$?
    if [ "$rc" -ne 0 ]; then
        echo "[addon] KX-Bridge mit Exit-Code $rc beendet." >&2
        exit "$rc"
    fi
    echo "[addon] KX-Bridge hat einen Neustart angefordert – starte neu ..."
    sleep 1
done
