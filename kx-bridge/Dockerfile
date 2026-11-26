# Dünner Wrapper um das offizielle KX-Bridge-Image (Multi-Arch), fest auf ein Release gepinnt.
FROM gitea.it-drui.de/viewit/kx-bridge:1.0.0-rc1

# nginx dient als Ingress-Proxy für die Home-Assistant-Seitenleiste.
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

COPY ingress/ /opt/kx-ingress/
COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
