# imagem nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# copia o build já gerado
COPY build/ .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
