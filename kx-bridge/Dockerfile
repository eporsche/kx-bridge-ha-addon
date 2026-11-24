# Dünner Wrapper um das offizielle KX-Bridge-Testing-Image (Multi-Arch).
# Der Supervisor baut mit --pull, "Neu aufbauen" holt also den aktuellen Testing-Build.
FROM gitea.it-drui.de/viewit/kx-bridge:testing

# nginx dient als Ingress-Proxy für die Home-Assistant-Seitenleiste.
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

COPY ingress/ /opt/kx-ingress/
COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
