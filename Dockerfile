FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html style.css app.js manifest.webmanifest icon.svg /usr/share/nginx/html/
COPY audio /usr/share/nginx/html/audio/
EXPOSE 80
