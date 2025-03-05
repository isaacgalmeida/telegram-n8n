# Telegram Monitor com N8N e Upload Local

Este projeto é um sistema em Node.js que monitora a conta do Telegram, captura mensagens e as envia via POST para um webhook do N8N. Além disso, o sistema implementa um mecanismo de redundância utilizando Redis para garantir que apenas uma instância esteja ativa em ambientes distribuídos.

## Funcionalidades

- **Monitoramento do Telegram:**  
  Conecta-se à conta do Telegram utilizando `api_id`, `api_hash` e uma `session string` gerada previamente (para autenticação de usuário).

- **Encaminhamento para o N8N:**  
  Cada mensagem recebida é enviada para o webhook configurado do N8N, permitindo a criação de fluxos de automação.

- **Redundância:**  
  O sistema utiliza Redis para implementar um mecanismo de lock distribuído, garantindo que apenas uma instância do serviço esteja ativa, mesmo se executada em múltiplas VPS ou containers.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 20 ou superior (caso deseje executar o projeto localmente fora do Docker)

## Configuração

1. **Arquivo de Variáveis de Ambiente (.env):**  
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (você pode usar o arquivo `.env.example` como base):

   ```dotenv
   TELEGRAM_API_ID=seu_api_id
   TELEGRAM_API_HASH=seu_api_hash
   TELEGRAM_SESSION_STRING=sua_session_string_gerada
   N8N_WEBHOOK_URL=https://seu-endpoint-n8n/webhook/telegram
   TELEGRAM_ERROR_CHAT_ID=seu_chat_id_para_erros
   REDIS_URL=redis://redis:6379
   ```

   **Observação:**  
   - A `TELEGRAM_SESSION_STRING` deve ser a string gerada para uma conta de usuário, não um token de bot.
   - Certifique-se de que não haja espaços ou quebras de linha indesejadas nos valores.

2. **Docker Compose:**  
   O arquivo `docker-compose.yml` está configurado para iniciar dois serviços:
   - **telegram-monitor:** Nosso serviço Node.js que monitora o Telegram e processa as mensagens.  
     A porta interna 3000, onde o Express serve os uploads, é mapeada para a porta 3010 do host.
   - **redis:** Instância do Redis usada para o lock distribuído.

   Exemplo de `docker-compose.yml`:

   ```yaml
   version: "3.9"
   services:
     telegram-monitor:
       build: .
       env_file: .env
       ports:
         - "3009:3000"
       depends_on:
         - redis
       restart: always

     redis:
       image: redis:alpine
       ports:
         - "6390:6379"
       restart: always
   ```

## Como Executar

### Usando Docker Compose

1. **Construa e Inicie os Containers:**

   No terminal, na raiz do projeto, execute:

   ```bash
   docker-compose up --build
   ```


### Executando Localmente (Sem Docker)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Execute o projeto com:

   ```bash
   node --env-file=.env src/index.js
   ```

## Estrutura do Projeto

```
/telegram-monitor
 ├── src/
 │    ├── index.js           # Ponto de entrada do aplicativo
 │    ├── telegramClient.js  # Configuração e conexão com a API do Telegram
 │    ├── webhook.js         # Lógica de envio dos dados para o webhook do N8N
 │    └── redundancy.js      # Implementação do mecanismo de lock distribuído utilizando Redis
 ├── .env.example             # Exemplo de arquivo de configuração de variáveis de ambiente
 ├── Dockerfile               # Arquivo para containerização
 ├── docker-compose.yml       # Orquestração dos serviços (telegram-monitor e redis)
 ├── package.json             # Dependências e scripts do projeto
 └── README.md                # Este arquivo
```

## Considerações Finais

- **Segurança:**  
  Não versionar o arquivo `.env` e utilizar práticas de segurança para as variáveis sensíveis.

- **Escalabilidade:**  
  Para ambientes de produção, avalie o uso de serviços de armazenamento externo (como AWS S3) para garantir alta disponibilidade e escalabilidade dos arquivos.

Este projeto foi desenvolvido para facilitar a integração entre o Telegram e o N8N, permitindo a automação de fluxos de trabalho a partir de mensagens (texto e mídia) recebidas via Telegram.

Caso tenha dúvidas ou sugestões de melhorias, sinta-se à vontade para contribuir.

