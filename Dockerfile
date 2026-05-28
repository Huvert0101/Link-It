# 1. Usar una imagen oficial de Node.js como base (versión LTS ligera)
FROM node:20-alpine

# 2. Definir el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar los archivos de configuración de dependencias
COPY package*.json ./

# 4. Instalar las dependencias de producción
RUN npm install --only=production

# 5. Copiar el resto del código fuente del proyecto
COPY . .

# 6. Exponer el puerto en el que corre tu aplicación Node.js
EXPOSE 3000

# 7. Comando para arrancar la aplicación cuando el contenedor inicie
CMD ["node", "index.js"]
