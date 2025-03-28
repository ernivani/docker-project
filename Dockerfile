FROM node:22

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm install -g prisma

RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && npm start"]