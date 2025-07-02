# Integração com CRM - Quote Builder

## Visão Geral

O Quote Builder agora oferece integração completa com os principais sistemas de CRM do mercado: **HubSpot**, **Salesforce** e **Pipedrive**. Esta funcionalidade permite sincronizar automaticamente contatos e propostas geradas no sistema com o CRM escolhido.

## Funcionalidades

### 🔗 Sincronização Automática
- Criação automática de contatos no CRM
- Criação automática de propostas/deals no CRM
- Mapeamento inteligente de estágios de vendas
- Sincronização de valores e moedas

### 📊 Dashboard e Analytics
- Estatísticas de sincronização em tempo real
- Taxa de sucesso das integrações
- Valor total das propostas sincronizadas
- Histórico completo de sincronizações
- Análise de performance por CRM

### ⚙️ Configuração Flexível
- Interface intuitiva para configuração
- Teste de conexão em tempo real
- Suporte a múltiplos tipos de CRM
- Validação automática de configurações

## CRMs Suportados

### 1. HubSpot
**Configuração:**
- Tipo: `hubspot`
- API Key: Access Token do HubSpot
- URL Base: Não necessário

**Mapeamento de Estágios:**
- `new` → `appointmentscheduled`
- `qualified` → `qualifiedtobuy`
- `proposal` → `presentationscheduled`
- `negotiation` → `contractsent`
- `closed_won` → `closedwon`
- `closed_lost` → `closedlost`

### 2. Salesforce
**Configuração:**
- Tipo: `salesforce`
- API Key: Access Token do Salesforce
- URL Base: URL da instância Salesforce (ex: `https://your-instance.salesforce.com`)

**Mapeamento de Estágios:**
- `new` → `Prospecting`
- `qualified` → `Qualification`
- `proposal` → `Proposal/Price Quote`
- `negotiation` → `Negotiation/Review`
- `closed_won` → `Closed Won`
- `closed_lost` → `Closed Lost`

### 3. Pipedrive
**Configuração:**
- Tipo: `pipedrive`
- API Key: Personal API Token do Pipedrive
- URL Base: Não necessário

**Mapeamento de Estágios:**
- `new` → `qualification`
- `qualified` → `proposal`
- `proposal` → `negotiation`
- `negotiation` → `negotiation`
- `closed_won` → `closed_won`
- `closed_lost` → `closed_lost`

## Como Configurar

### 1. Acessar Configurações
1. Faça login no sistema como administrador
2. Navegue para `/admin/settings`
3. Localize a seção "Configuração de CRM"

### 2. Obter API Key

#### HubSpot
1. Acesse o [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Crie um Private App
3. Configure as permissões necessárias:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
4. Copie o Access Token gerado

#### Salesforce
1. Acesse Setup > Users > Profile
2. Crie um Connected App
3. Configure OAuth 2.0
4. Defina as permissões necessárias:
   - `api`
   - `refresh_token`
   - `offline_access`
5. Copie o Access Token

#### Pipedrive
1. Acesse Settings > Personal Preferences
2. Vá para API > Personal API Tokens
3. Gere um novo token
4. Copie o token gerado

### 3. Configurar no Sistema
1. Selecione o tipo de CRM
2. Cole a API Key no campo correspondente
3. Para Salesforce, adicione a URL da instância
4. Clique em "Testar Conexão"
5. Se o teste for bem-sucedido, clique em "Salvar Configuração"

## Como Usar

### Sincronização Manual
1. Gere uma proposta no sistema
2. Preencha os dados do cliente
3. Clique no botão "Sincronizar CRM"
4. O sistema criará automaticamente:
   - Um contato no CRM com os dados do cliente
   - Uma proposta/deal no CRM com o valor e detalhes

### Dados Sincronizados

#### Contato
- Nome completo
- E-mail
- Telefone
- Empresa
- Endereço (quando disponível)

#### Proposta/Deal
- Título da proposta
- Valor total
- Moeda
- Estágio (sempre "proposal" inicialmente)
- Descrição
- Data de fechamento estimada (30 dias)
- Probabilidade (50%)

## Monitoramento

### Dashboard
O dashboard mostra:
- Total de sincronizações
- Taxa de sucesso
- Valor total das propostas
- Atividade recente
- CRM mais utilizado

### Histórico
O histórico inclui:
- Data e hora da sincronização
- Tipo de CRM
- Status (sucesso/erro/pendente)
- Dados do contato e proposta
- IDs gerados no CRM
- Mensagens de erro (quando aplicável)

## Tratamento de Erros

### Erros Comuns
1. **API Key inválida**: Verifique se a chave está correta
2. **URL base inválida** (Salesforce): Verifique a URL da instância
3. **Permissões insuficientes**: Configure as permissões corretas no CRM
4. **Limite de API**: Aguarde o reset do limite ou atualize o plano

### Logs
Todos os erros são registrados no histórico de sincronizações com detalhes específicos para facilitar a resolução.

## API Endpoints

### POST `/api/crm/sync`
Sincroniza uma proposta com o CRM.

**Body:**
```json
{
  "crmConfig": {
    "type": "hubspot",
    "apiKey": "your-api-key"
  },
  "contact": {
    "email": "cliente@exemplo.com",
    "firstName": "João",
    "lastName": "Silva",
    "company": "Empresa Exemplo",
    "phone": "+5511999999999"
  },
  "deal": {
    "title": "Proposta - Serviço X",
    "amount": 5000,
    "currency": "BRL",
    "stage": "proposal",
    "description": "Descrição da proposta"
  }
}
```

### GET `/api/crm/sync`
Testa a conexão com o CRM.

**Query Parameters:**
- `type`: Tipo do CRM (hubspot/salesforce/pipedrive)
- `apiKey`: API Key do CRM
- `baseUrl`: URL base (apenas para Salesforce)

## Segurança

### Armazenamento
- As configurações são armazenadas no localStorage do navegador
- API Keys são criptografadas antes do armazenamento
- Dados sensíveis não são enviados para logs

### Validação
- Todas as configurações são validadas antes do uso
- Conexões são testadas antes da sincronização
- Erros são tratados de forma segura

## Limitações

### Rate Limits
- **HubSpot**: 100 requests/10 seconds
- **Salesforce**: 15,000 requests/day
- **Pipedrive**: 100 requests/10 seconds

### Campos Suportados
- Apenas campos padrão dos CRMs são suportados
- Campos customizados podem ser adicionados via configuração

## Próximas Funcionalidades

### Planejadas
- [ ] Sincronização bidirecional
- [ ] Mapeamento de campos customizados
- [ ] Sincronização em lote
- [ ] Webhooks para atualizações em tempo real
- [ ] Suporte a mais CRMs (Zoho, Monday.com, etc.)
- [ ] Relatórios avançados
- [ ] Integração com automações de marketing

### Melhorias
- [ ] Interface mais intuitiva
- [ ] Templates de proposta personalizáveis
- [ ] Sincronização de anexos
- [ ] Backup automático de configurações

## Suporte

Para dúvidas ou problemas com a integração:
1. Verifique a documentação do CRM específico
2. Teste a conexão nas configurações
3. Consulte o histórico de sincronizações
4. Entre em contato com o suporte técnico

---

**Versão:** 1.0.0  
**Última atualização:** 02/07/2025  
**Compatibilidade:** HubSpot, Salesforce, Pipedrive 