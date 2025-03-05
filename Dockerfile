FROM node:20-alpine

# Cria o usuário não privilegiado
RUN adduser -h /var/nodeapp -s /bin/bash -D nodeapp

WORKDIR /var/nodeapp

# Copia os arquivos de dependências e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante da aplicação
COPY . .

# Ajusta as permissões para o usuário não privilegiado
RUN chown -R nodeapp:nodeapp /var/nodeapp

# Expondo a porta (útil para health-check ou debug, se necessário)
EXPOSE 3009

ARG VERSION
ENV VERSION=${VERSION:-1.0.0}

# Executa a aplicação com o usuário não privilegiado
USER nodeapp
CMD ["node", "src/index.js"]
