# 📋 Notas de Lançamento - 3DPrinterCalcApp

Este documento contém o changelog detalhado para todas as versões do aplicativo 3D Printer Calculator.

---

## v2.0.0 (2025) - 🚀 Monitoramento de Desempenho & Sistema de Registro de Auditoria

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


