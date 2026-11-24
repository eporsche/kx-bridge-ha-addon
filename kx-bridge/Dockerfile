# Dünner Wrapper um das offizielle KX-Bridge-Testing-Image (Multi-Arch).
# Der Supervisor baut mit --pull, "Neu aufbauen" holt also den aktuellen Testing-Build.
FROM gitea.it-drui.de/viewit/kx-bridge:testing

COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
