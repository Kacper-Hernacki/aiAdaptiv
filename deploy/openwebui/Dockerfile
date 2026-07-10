# aiAdaptiv-branded Open WebUI.
# Extends the official image and overwrites the branding assets with the aiAdaptiv logo.
# Build context = this directory (deploy/openwebui). Koyeb: set Dockerfile path to deploy/openwebui/Dockerfile.
FROM ghcr.io/open-webui/open-webui:main

# Product name (shown in the UI, tab title, PWA)
ENV WEBUI_NAME=aiAdaptiv

# Swap in the aiAdaptiv logo/favicon/splash in both static locations the app serves from
COPY assets/ /tmp/brand/
RUN set -e; \
    for d in /app/backend/open_webui/static /app/build/static; do \
      cp -f /tmp/brand/*.png /tmp/brand/*.ico /tmp/brand/*.svg "$d/" 2>/dev/null || true; \
    done; \
    cp -f /tmp/brand/favicon.png /app/build/favicon.png; \
    rm -rf /tmp/brand
