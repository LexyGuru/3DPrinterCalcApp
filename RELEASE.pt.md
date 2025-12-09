# 📋 Notas de Lançamento - 3DPrinterCalcApp

Este documento contém o changelog detalhado para todas as versões do aplicativo 3D Printer Calculator.

---

## v3.0.3 (2025) - 🔧 Hotfix: Correções de Criptografia de Dados do Cliente e Melhorias de UI

### 🐛 Correções de Erros

#### Correções de Criptografia de Dados do Cliente
- **Ações de oferta desabilitadas para dados criptografados** - Se os dados do cliente estão criptografados e nenhuma senha é fornecida, a edição, duplicação e mudança de status das ofertas agora estão desabilitadas
- **Problema de chave duplicada corrigido** - Não há mais erros "Encountered two children with the same key" na lista de ofertas e histórico de status
- **Correção do contador de ofertas** - O contador de ofertas do cliente agora conta também por `customerId`, não apenas por nome, funcionando corretamente com dados criptografados
- **Atualização de ofertas após inserir senha** - Quando a senha é fornecida e os clientes são descriptografados, os nomes dos clientes nas ofertas são restaurados em vez de "DADOS CRIPTOGRAFADOS"
- **Lista de histórico de status** - A lista de histórico de status agora mostra apenas o ID do cliente, não o nome do cliente, mesmo após inserir a senha (conforme requisitos de criptografia)

#### Melhorias de Mensagens Toast
- **Prevenção de mensagens toast duplicadas** - As mensagens toast agora aparecem apenas uma vez, mesmo se chamadas múltiplas vezes
- **Toast fecha ao clicar no botão** - Ao clicar no botão "Inserir senha" na mensagem toast, o toast fecha automaticamente
- **Redesign da mensagem toast** - As mensagens toast agora têm uma aparência mais limpa e profissional com layout de coluna para botões de ação

#### Chaves de Tradução Adicionadas
- **Novas chaves de tradução** - Adicionadas a todos os 13 idiomas:
  - `encryption.passwordRequired` - "Senha de criptografia necessária"
  - `encryption.passwordRequiredForOfferEdit` - "Senha de criptografia necessária para editar a oferta"
  - `encryption.passwordRequiredForOfferDuplicate` - "Senha de criptografia necessária para duplicar a oferta"
  - `encryption.passwordRequiredForOfferStatusChange` - "Senha de criptografia necessária para alterar o status da oferta"
  - `encryption.passwordRequiredForCustomerCreate` - "Senha de criptografia necessária para criar um novo cliente"
  - `encryption.passwordRequiredForCustomerEdit` - "Senha de criptografia necessária para editar"
  - `encryption.encryptedData` - "DADOS CRIPTOGRAFADOS"
  - `customers.id` - "ID do Cliente"
  - `customers.encryptedDataMessage` - "🔒 Dados criptografados - senha necessária para visualizar"

### 📝 Detalhes Técnicos

- **Versão atualizada**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.3`
- **Strings hardcoded substituídas**: Todas as strings hardcoded em húngaro substituídas por chaves de tradução
- **Tipos TypeScript atualizados**: Novas chaves de tradução adicionadas ao tipo `TranslationKey`
- **Toast Provider modificado**: Verificação de toast duplicado e fechamento automático adicionados
- **Lógica de atualização de ofertas**: Atualização automática de ofertas após descriptografia de clientes quando senha é fornecida

---

## v3.0.2 (2025) - 🔧 Hotfix: Correções do Tutorial, Permissões, Registro de Factory Reset

### 🐛 Correções de Erros

#### Correções do Tutorial
- **Preservação de dados do tutorial** - Se o tutorial já foi executado uma vez, os dados existentes não são excluídos novamente
- **Tutorial expandido para 18 passos** - Adicionado: Projetos, Tarefas, Calendário, passos de Backup/Restauração
- **Chaves de tradução do tutorial** - Chaves de tradução faltantes adicionadas a todos os arquivos de idioma

#### Correções de Permissões
- **Permissões customers.json** - Permissões adicionadas para exclusão do arquivo `customers.json`

#### Registro de Factory Reset
- **Gravação de arquivo de log do backend** - Os passos de Factory Reset agora são registrados no arquivo de log do backend
- **Registro detalhado** - Cada passo de Factory Reset é registrado em detalhes
- **Exclusão de log do backend restaurada** - O arquivo de log do backend agora é excluído durante o Factory Reset

### 📝 Detalhes Técnicos

- **Versão atualizada**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Traduções, Beta Build Workflow

### 🐛 Correções de Erros

#### Correção do Factory Reset
- **Factory reset corrigido** - O arquivo `customers.json` agora é explicitamente excluído durante o factory reset
- **Exclusão completa dos dados do cliente** - O arquivo de dados do cliente criptografados (`customers.json`) também é excluído, garantindo a exclusão completa dos dados

#### Chaves de Tradução Faltantes
- **Chave `encryption.noAppPassword` adicionada** - Chave de tradução faltante adicionada a todos os 14 idiomas
- **Traduções de mensagens de backup** - Traduções para a mensagem "Ainda não há arquivos de backup automático" adicionadas
- **Traduções de gerenciamento de logs** - Traduções para textos de gerenciamento de Log e Audit Log adicionadas:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Traduções do calendário** - Traduções para nomes de meses e dias adicionadas:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Descrição do menu de ajuda** - Traduções para a descrição "Show Help menu item in Sidebar" adicionadas

#### Correção do Workflow Beta Build
- **Checkout explícito do branch beta** - O workflow agora usa explicitamente o commit mais recente do branch `beta`
- **Correção do commit da tag** - A tag `beta-v3.0.1` agora aponta para o commit correto (não o commit antigo)
- **Correção da data do código-fonte** - A data "Source code" agora mostra o tempo de compilação, não a data do commit antigo
- **Etapas de verificação adicionadas** - Verificação Git pull e commit SHA adicionada ao workflow

### 📝 Detalhes Técnicos

- **Versão atualizada**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Chaves duplicadas removidas**: Duplicações de `settings.logs.openFolder` removidas de todos os arquivos de idioma
- **Tipos TypeScript atualizados**: `encryption.noAppPassword` adicionado ao tipo `TranslationKey`

---

## v3.0.0 (2025) - 🔒 Criptografia de Dados de Clientes & Conformidade GDPR + ⚡ Otimização de Desempenho

### ⚡ Otimização de Desempenho e Code Splitting

#### Documentação e Otimização de React.lazy()
- **Documentação de implementação React.lazy()** - Documentação completa criada (`docs/PERFORMANCE.md`)
- **Otimização de fase de carregamento** - Apenas dados são carregados durante a fase de carregamento, componentes sob demanda
- **Otimização de fallback Suspense** - Componentes fallback otimizados em AppRouter.tsx
- **Error boundary adicionado** - Componente LazyErrorBoundary.tsx para componentes lazy carregados

#### Code Splitting Baseado em Rotas
- **Integração React Router** - React Router v7.10.0 instalado e configurado
- **Navegação baseada em URL** - Estrutura de rotas implementada (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy loading para rotas** - Cada rota automaticamente dividida em arquivos separados
- **Conversão State-based → Routing** - Estado `activePage` convertido para routing baseado em URL
- **Páginas marcáveis** - Todas as páginas acessíveis via URL direta
- **Suporte de navegação do navegador** - Botões voltar/avançar funcionam, melhor UX

#### Ajuste Fino de Code Splitting
- **Otimização de configuração de build Vite** - `rollupOptions.output.manualChunks` configurado
- **Otimização de chunks vendor**:
  - React/React-DOM/React-Router chunk separado (`vendor-react`)
  - APIs Tauri chunk separado (`vendor-tauri`)
  - Bibliotecas UI chunks separados (`vendor-ui-framer`, `vendor-ui-charts`)
  - Outros node_modules (`vendor`)
- **Chunking baseado em rotas** - Lazy loading automático cria chunks separados por rota
- **Agrupamento de arquivos de router** - Organizados em chunks `router`, `routes`
- **Agrupamento de componentes compartilhados** - Chunk `components-shared`
- **Limite de aviso de tamanho de chunk** - Definido em 1000 KB

#### Arquitetura Modular
- **Documentação de arquitetura modular** - Documentação completa (`docs/MODULAR_ARCHITECTURE.md`)
- **Aliases de caminho** - Aliases `@features`, `@shared`, `@core` configurados
- **Configuração Vite e TypeScript** - Atualizada com suporte de aliases de caminho
- **Implementação de módulos compartilhados**:
  - Componentes compartilhados (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Hooks compartilhados (useModal, useForm)
  - Utilitários compartilhados (debounce, format, validation)
- **Refatoração de módulos de recursos** - Refatoração completa de 6 módulos:
  - Calculator: 582 linhas → 309 linhas (-46.9%)
  - Settings: 5947 linhas → 897 linhas (-85%!)
  - Offers: 3985 linhas → 3729 linhas (-6.4%)
  - Home: 3454 linhas → 3308 linhas (-4.2%)
  - Módulos Filaments e Printers também refatorados

### 🔒 Criptografia de Dados de Clientes
- **Criptografia AES-256-GCM** - Armazenamento criptografado de dados de clientes usando o algoritmo padrão da indústria AES-256-GCM
- **Hash de senha PBKDF2** - Armazenamento seguro de senhas usando o algoritmo PBKDF2 (100.000 iterações, SHA-256)
- **Armazenamento em arquivo separado** - Dados criptografados de clientes são armazenados em um arquivo separado `customers.json`
- **Gerenciamento de senha em memória** - Senhas são armazenadas apenas na memória e excluídas ao fechar o aplicativo
- **Integração de senha do aplicativo** - Opcional: a senha de proteção do aplicativo também pode ser usada para criptografia
- **Sistema de solicitação de senha** - Solicitação inteligente de senha (não aparece na tela de carregamento, após a mensagem de boas-vindas)
- **Proteção de integridade de dados** - Dados criptografados protegidos contra exclusão acidental

### ✅ Proteção de Dados em Conformidade com GDPR/UE
- **Conformidade**: O aplicativo gerencia dados de clientes em conformidade com o GDPR (Regulamento Geral sobre a Proteção de Dados) e regulamentos de proteção de dados da UE
- **Criptografia padrão da indústria**: Uso do algoritmo AES-256-GCM (atende às recomendações da UE)
- **Gerenciamento seguro de senhas**: Algoritmo de hash PBKDF2 (recomendado pelo NIST)
- **Coleta mínima de dados**: Armazena apenas os dados de clientes necessários para o aplicativo
- **Retenção de dados**: O usuário tem controle total sobre o armazenamento e exclusão de dados
- **Controle de acesso**: Acesso protegido por senha aos dados de clientes

### 🎨 Melhorias de UI/UX
- **Modal de ativação de criptografia** - Nova caixa de diálogo modal para ativar a criptografia com opção de senha do aplicativo
- **Aprimoramento do ConfirmDialog** - Suporte a conteúdo personalizado para componentes modais
- **Temporização da solicitação de senha** - Exibição inteligente (não na tela de carregamento)
- **Integração de configurações** - Configurações de criptografia na guia Segurança

### 🔧 Melhorias Técnicas
- **Módulo de criptografia do backend** - Criptografia implementada em Rust (`src-tauri/src/encryption.rs`)
- **Utilitários de criptografia do frontend** - Funções utilitárias TypeScript para gerenciamento de criptografia
- **Gerenciador de senhas** - Sistema de gerenciamento de senhas em memória
- **Integração de armazenamento** - Funções saveCustomers/loadCustomers com integração de criptografia

### 📚 Suporte de Idiomas
- **13 idiomas atualizados** - Novas chaves de tradução de criptografia em todos os arquivos de idioma
- **Novas chaves**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Monitoramento de Desempenho & Sistema de Registro de Auditoria

### 🌐 Localização de Mensagens do Console
- **Localização completa do console** - Todas as mensagens do console são exibidas no idioma selecionado
- **Tradução de operações de armazenamento** - Mensagens de carregamento e salvamento (impressoras, filamentos, configurações, ofertas, clientes, projetos, tarefas)
- **Tradução de mensagens de backup** - Verificação diária de backup, criação de backup, mensagens de rotação
- **Tradução de mensagens de rotação de log** - Mensagens de rotação de log e log de auditoria com partes dinâmicas
- **Tradução de métricas de desempenho** - Métricas de CPU e memória, mensagens de registro regulares
- **Tradução de mensagens do sistema** - Inicialização da aplicação, inicialização do log frontend, mensagem de boas-vindas
- **Tradução de mensagens de múltiplas partes** - Tradução de partes de dados de mensagens do console (data, timestamp, arquivo, informações de status)
- **Suporte para 13 idiomas** - Todas as mensagens do console traduzidas para inglês, húngaro, alemão, espanhol, italiano, polonês, português, russo, ucraniano, tcheco, eslovaco e chinês

### ⚡ Registro de Métricas de Desempenho
- **Classe Performance Timer** - Temporização manual para operações
- **Medição de tempo de carregamento** - Todos os tempos de carregamento dos módulos registrados (Settings, Printers, Filaments, Offers, Customers)
- **Medição de tempo de operação** - Temporização automática para operações assíncronas e síncronas
- **Monitoramento de uso de memória** - Rastreamento e registro de memória heap JavaScript
- **Monitoramento de uso de CPU** - Medição regular de uso de CPU a cada 5 minutos
- **Resumo de desempenho** - Estatísticas agregadas para tempos de carregamento e operação
- **Mensagens de log estruturadas** - Exibição detalhada de porcentagem de CPU e valores de memória
- **Comandos de desempenho do backend** - Comando backend `get_performance_metrics` para dados de CPU e memória

### 🔐 Implementação de Registro de Auditoria
- **Infraestrutura de registro de auditoria** - Arquivo de registro de auditoria separado (`audit-YYYY-MM-DD.json`)
- **Registro de operações críticas**:
  - Operações CRUD (Criar/Atualizar/Excluir para Filaments, Printers, Offers, Customers)
  - Alterações de configurações (tema, idioma, configurações de log, autosave, etc.)
  - Operações de backup (criar, restaurar)
  - Operações de Reset de Fábrica
  - Registro de erros
- **Visualizador de Registro de Auditoria** - Rolagem virtual para arquivos grandes, com filtragem, pesquisa e capacidades de exportação
- **Limpeza automática** - Arquivos antigos de registro de auditoria excluídos automaticamente com base em dias de retenção configuráveis
- **Comandos do backend** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Localização completa** - Todos os 13 idiomas suportados

### 🎯 Melhorias de UI/UX
- **Histórico de Registro de Auditoria** - Layout de duas colunas na seção Configurações → Gerenciamento de Logs
- **Exibição de métricas de desempenho** - No modal de Diagnóstico do Sistema
- **Atualizações em tempo real do Visualizador de Logs** - Alternância de auto-atualização, detecção de alterações baseada em hash
- **Refinamento de auto-rolagem** - Consciência da posição de rolagem do usuário

### 🔧 Melhorias Técnicas
- **Otimização de verificação de atualizações do GitHub** - Na inicialização e a cada 5 horas (baseado em localStorage)
- **Formato de tag beta** - Tag separado `beta-v2.0.0` para versões beta (não sobrescreve a versão principal)
- **Lógica do verificador de versão** - Busca de versão beta baseada no prefixo `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnóstico do Sistema & Melhorias de Desempenho

### 🔍 Diagnóstico do Sistema
- **Ferramenta abrangente de verificação de saúde do sistema**:
  - Exibição de informações do sistema (CPU, memória, OS, GPU, disco)
  - Validação do sistema de arquivos (data.json, filamentLibrary.json, update_filament.json)
  - Verificações de disponibilidade de módulos (Settings, Offers, Printers, Customers, Calculator, Home)
  - Verificações de disponibilidade de armazenamento de dados
  - Barra de progresso com mensagens de status detalhadas
  - Resumo com estados de erros/avisos/sucesso
  - Botão de executar novamente
- **Movido para a seção Gerenciamento de Logs** (posicionamento mais lógico)
- **Localização completa** em todos os 13 idiomas suportados

### ⚡ Desempenho do Visualizador de Logs
- **Rolagem virtual para arquivos de log grandes**:
  - Implementação personalizada de rolagem virtual para componente LogViewer
  - Apenas entradas de log visíveis são renderizadas, melhorando significativamente o desempenho
  - Rolagem e pesquisa suaves mesmo com arquivos de log enormes (100k+ linhas)
  - Mantém posição e altura precisas da barra de rolagem
  - Operações de pesquisa e filtragem significativamente mais rápidas

### 🔔 Sistema de Notificações Unificado
- **Serviço central de notificações**:
  - Um único `notificationService` para notificações Toast e de plataforma
  - Roteamento de notificações baseado em prioridade (alta prioridade → notificação de plataforma)
  - Tomada de decisão automática baseada no estado do aplicativo (primeiro plano/fundo)
  - Compatível com funções de notificação existentes
  - Configurações de notificação configuráveis (Toast ligado/desligado, notificação de plataforma ligada/desligada, níveis de prioridade)

### 🎯 Melhorias de UI/UX
- Diagnóstico do Sistema movido da seção Backup para a seção Gerenciamento de Logs (posicionamento mais lógico)
- Erros do linter TypeScript corrigidos (variáveis não utilizadas, discrepâncias de tipo)
- Qualidade do código e manutenibilidade melhoradas

---

## v1.8.0 (2025) - 📊 Sistema Avançado de Registro & Melhorias de Reset de Fábrica

### 🔄 Modal de Progresso de Reset de Fábrica
- **Indicador de progresso visual para reset de fábrica**:
  - Progresso animado de 4 etapas (exclusão de backup, exclusão de log, exclusão de configuração, conclusão)
  - Atualizações de status em tempo real com mensagens de sucesso/erro
  - Contagem regressiva de 10 segundos antes da exibição do seletor de idioma
  - Modal não pode ser fechado durante o processo de reset
  - Localização completa em todos os 13 idiomas suportados

### 📋 Revisão Completa do Sistema de Registro
- **Infraestrutura de registro profissional**:
  - Caminhos de arquivos de log multiplataforma (diretórios de dados específicos da plataforma)
  - Registro de informações do sistema (CPU, memória, OS, GPU, disco, versão do aplicativo)
  - Registro de informações de diretórios (pastas de logs e backups, contagem de arquivos, tamanhos)
  - Registro detalhado de status de carregamento (sucesso/aviso/erro/crítico)
  - Níveis de log (DEBUG, INFO, WARN, ERROR) com filtragem
  - Suporte a formato de log estruturado (texto e JSON)
  - Rotação de log com limpeza automática (dias de retenção configuráveis)
  - Modal do Visualizador de Logs com filtragem, pesquisa, realce e exportação
  - Configuração de log em Configurações (formato, nível, dias de retenção)
  - Conteúdo do arquivo de log preservado ao reiniciar o aplicativo (modo anexar)

### 🔍 Diagnóstico do Sistema
- **Modal de verificação de saúde do sistema**:
  - Exibição e validação de informações do sistema
  - Monitoramento de uso de memória com avisos
  - Verificações de existência de arquivos
  - Verificações de disponibilidade de módulos
  - Testes de disponibilidade de armazenamento de dados
  - Exibição de barra de progresso e resumo
  - Localização completa em todos os 13 idiomas suportados

### 🛠️ Melhorias Técnicas
- Registro desativado durante Reset de Fábrica para evitar poluição de log
- Criação de data.json atrasada até a seleção de idioma (processo de Reset de Fábrica mais limpo)
- Inicialização do arquivo de log atrasada até a seleção de idioma
- Reinício automático do aplicativo após seleção de idioma
- Comandos do backend para gerenciamento de arquivos de backup e log
- Manipulação de caminhos multiplataforma para backups e logs
- Cálculo de memória corrigido (compatibilidade com sysinfo 0.31)
- Avisos de estilo React corrigidos (conflitos de abreviação CSS)

---

## v1.7.0 (2025) - 💾 Sistema de backup, tela de carregamento e melhorias da biblioteca de filamentos

### 💾 Implementação Completa do Sistema de Backup
- **Sistema automático de backup** - Um arquivo de backup por dia (criado apenas em dia novo)
- **Hook de lembrete de backup e componente UI** - Notificação se não houver backup
- **UI de Histórico de Backup em Configurações** - Lista codificada por cores (verde/amarelo/vermelho/cinza) para idade do arquivo de backup e contagem regressiva de exclusão
- **Janela modal de autosave** - Explicação quando autosave está habilitado
- **Sincronização de autosave e backup automático** - Backup automático ao salvar com autosave
- **Reset de Fábrica com exclusão automática de arquivos de backup**
- **Histórico de backup atualiza automaticamente** quando autosave está habilitado

### 🔧 Otimização do Backend do Sistema de Backup
- **Comandos do backend adicionados** para excluir backups antigos (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funções de limpeza do frontend atualizadas para usar comandos do backend**, eliminando erros de "forbidden path"
- **Todas as operações de arquivos (criar, excluir, listar) agora acontecem do backend**, evitando problemas de permissões Tauri

### ⚡ Otimização de Desempenho do Sistema de Backup
- `hasTodayBackup()` otimizado: usa comando backend `list_backup_files`, não precisa ler todos os arquivos
- **Mecanismo de bloqueio adicionado** para prevenir backups paralelos
- **Operação mais rápida** mesmo com grande número de arquivos de backup

### 📁 Abertura do Diretório de Backup e Histórico de Logs
- **Botão adicionado** na seção Configurações → Histórico de Backup para abrir pasta de backup
- **Nova seção de histórico de logs** em Configurações - listar e abrir arquivos de log
- **Exclusão automática de arquivos de log** configurável por dias
- **Suporte multiplataforma** (macOS, Windows, Linux)

### 🎨 Revisão Completa da Tela de Carregamento
- **Logo do aplicativo integrado** como fundo com efeito glassmorphism
- **Layout fixo para marcas de verificação** - Rolagem automática, apenas 3 módulos visíveis por vez
- **Efeito shimmer, animações de pontos pulsantes**
- **Contêiner de rolagem** com barra de rolagem oculta

### ⚙️ Melhorias do Processo de Carregamento
- **Carregamento desacelerado** (atrasos de 800ms) - mensagens de carregamento são legíveis
- **Tratamento de erros para todos os módulos** (blocos try-catch)
- **Arquivo de log físico** para todos os status e erros
- **Resumo de carregamento** no final

### 🎨 Suporte Multilíngue da Biblioteca de Filamentos
- **Cores de filamentos exibidas** em todos os idiomas suportados (não apenas Húngaro/Alemão/Inglês)
- **Lógica de fallback**: Inglês → Húngaro → Alemão → cor/nome bruto
- Componentes Settings, GlobalSearch e Filaments atualizados

### 🔄 Melhorias de Reset de Fábrica
- **Exclusão física de arquivos** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset de instância de Store** sem recarregamento
- **Exibição do seletor de idioma** após Reset de Fábrica

### 🎓 Atualização do Tutorial com Novos Recursos v1.7.0
- Novos passos: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Dados de demonstração expandidos: 6 filamentos → 11 filamentos, 3 ofertas → 5 ofertas
- Chaves de tradução adicionadas para todos os idiomas

---

## v1.6.0 (2025) - 📊 Widgets interativos & ajuste de desempenho de tabelas grandes

### 🧠 Gráficos Interativos e Visualizações Modais Detalhadas
- **Gráficos principais do painel usam componente unificado `InteractiveChart`** com pontos de dados clicáveis e visualização modal detalhada animada
- **Tooltip e visualização detalhada estão localizados**, mostrando rótulos legíveis (receita, custo, lucro líquido, contagem de ofertas)
- **Período de tempo pode ser definido diretamente do gráfico de tendências** (semanal / mensal / anual) usando brush, dados fatiados fluem para Home → Dashboard

### 🧵 Rolagem Virtual para Listas Grandes
- **Rolagem virtual personalizada** para lista de Ofertas e tabela de Filamentos – apenas linhas visíveis são renderizadas, garantindo rolagem suave mesmo com 10k+ registros
- **Configurações → Biblioteca de Filamentos** usa o mesmo padrão, mantendo a paleta completa de 12,000+ cores responsiva
- **Posição/altura da barra de rolagem permanece correta** graças aos elementos espaçadores acima e abaixo do intervalo visível

### 📋 Classificação e Filtragem Avançada de Tabelas
- **Classificação de várias colunas** nas páginas de Filamentos e Ofertas (clique: crescente/decrescente, Shift+clique: construir cadeia de classificação – ex., "Marca ↑, então Preço/kg ↓")
- **Configurações de classificação salvas em `settings`**, então a ordem preferida persiste após reinicialização
- **Filamentos**: filtros de nível de coluna para marca, material/tipo e valor de cor/HEX
- **Ofertas**: filtro de valor com valores min/máx e filtros de intervalo de datas (de / até)

---

**Última atualização**: 1 de dezembro de 2025



- **Sistema automático de backup** - Um arquivo de backup por dia (criado apenas em dia novo)
- **Hook de lembrete de backup e componente UI** - Notificação se não houver backup
- **UI de Histórico de Backup em Configurações** - Lista codificada por cores (verde/amarelo/vermelho/cinza) para idade do arquivo de backup e contagem regressiva de exclusão
- **Janela modal de autosave** - Explicação quando autosave está habilitado
- **Sincronização de autosave e backup automático** - Backup automático ao salvar com autosave
- **Reset de Fábrica com exclusão automática de arquivos de backup**
- **Histórico de backup atualiza automaticamente** quando autosave está habilitado

### 🔧 Otimização do Backend do Sistema de Backup
- **Comandos do backend adicionados** para excluir backups antigos (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funções de limpeza do frontend atualizadas para usar comandos do backend**, eliminando erros de "forbidden path"
- **Todas as operações de arquivos (criar, excluir, listar) agora acontecem do backend**, evitando problemas de permissões Tauri

### ⚡ Otimização de Desempenho do Sistema de Backup
- `hasTodayBackup()` otimizado: usa comando backend `list_backup_files`, não precisa ler todos os arquivos
- **Mecanismo de bloqueio adicionado** para prevenir backups paralelos
- **Operação mais rápida** mesmo com grande número de arquivos de backup

### 📁 Abertura do Diretório de Backup e Histórico de Logs
- **Botão adicionado** na seção Configurações → Histórico de Backup para abrir pasta de backup
- **Nova seção de histórico de logs** em Configurações - listar e abrir arquivos de log
- **Exclusão automática de arquivos de log** configurável por dias
- **Suporte multiplataforma** (macOS, Windows, Linux)

### 🎨 Revisão Completa da Tela de Carregamento
- **Logo do aplicativo integrado** como fundo com efeito glassmorphism
- **Layout fixo para marcas de verificação** - Rolagem automática, apenas 3 módulos visíveis por vez
- **Efeito shimmer, animações de pontos pulsantes**
- **Contêiner de rolagem** com barra de rolagem oculta

### ⚙️ Melhorias do Processo de Carregamento
- **Carregamento desacelerado** (atrasos de 800ms) - mensagens de carregamento são legíveis
- **Tratamento de erros para todos os módulos** (blocos try-catch)
- **Arquivo de log físico** para todos os status e erros
- **Resumo de carregamento** no final

### 🎨 Suporte Multilíngue da Biblioteca de Filamentos
- **Cores de filamentos exibidas** em todos os idiomas suportados (não apenas Húngaro/Alemão/Inglês)
- **Lógica de fallback**: Inglês → Húngaro → Alemão → cor/nome bruto
- Componentes Settings, GlobalSearch e Filaments atualizados

### 🔄 Melhorias de Reset de Fábrica
- **Exclusão física de arquivos** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset de instância de Store** sem recarregamento
- **Exibição do seletor de idioma** após Reset de Fábrica

### 🎓 Atualização do Tutorial com Novos Recursos v1.7.0
- Novos passos: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Dados de demonstração expandidos: 6 filamentos → 11 filamentos, 3 ofertas → 5 ofertas
- Chaves de tradução adicionadas para todos os idiomas

---

## v1.6.0 (2025) - 📊 Widgets interativos & ajuste de desempenho de tabelas grandes

### 🧠 Gráficos Interativos e Visualizações Modais Detalhadas
- **Gráficos principais do painel usam componente unificado `InteractiveChart`** com pontos de dados clicáveis e visualização modal detalhada animada
- **Tooltip e visualização detalhada estão localizados**, mostrando rótulos legíveis (receita, custo, lucro líquido, contagem de ofertas)
- **Período de tempo pode ser definido diretamente do gráfico de tendências** (semanal / mensal / anual) usando brush, dados fatiados fluem para Home → Dashboard

### 🧵 Rolagem Virtual para Listas Grandes
- **Rolagem virtual personalizada** para lista de Ofertas e tabela de Filamentos – apenas linhas visíveis são renderizadas, garantindo rolagem suave mesmo com 10k+ registros
- **Configurações → Biblioteca de Filamentos** usa o mesmo padrão, mantendo a paleta completa de 12,000+ cores responsiva
- **Posição/altura da barra de rolagem permanece correta** graças aos elementos espaçadores acima e abaixo do intervalo visível

### 📋 Classificação e Filtragem Avançada de Tabelas
- **Classificação de várias colunas** nas páginas de Filamentos e Ofertas (clique: crescente/decrescente, Shift+clique: construir cadeia de classificação – ex., "Marca ↑, então Preço/kg ↓")
- **Configurações de classificação salvas em `settings`**, então a ordem preferida persiste após reinicialização
- **Filamentos**: filtros de nível de coluna para marca, material/tipo e valor de cor/HEX
- **Ofertas**: filtro de valor com valores min/máx e filtros de intervalo de datas (de / até)

---

**Última atualização**: 1 de dezembro de 2025


