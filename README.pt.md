# 🖨️ 3D Printer Calculator App

> **🌍 Seleção de idioma**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Uma aplicação desktop moderna para calcular custos de impressão 3D. Construída com Tauri v2, frontend React e backend Rust.

## ✨ Funcionalidades

- 📊 **Cálculo de custos** - Cálculo automático de custos de filamento, eletricidade, secagem e desgaste
- 🧵 **Gestão de filamentos** - Adicionar, editar, excluir filamentos (marca, tipo, cor, preço)
- 🖨️ **Gestão de impressoras** - Gerenciar impressoras e sistemas AMS
- 💰 **Cálculo de lucro** - Percentual de lucro selecionável (10%, 20%, 30%, 40%, 50%)
- 📄 **Cotações** - Salvar, gerenciar e exportar cotações PDF (nome do cliente, contato, descrição)
- 🧠 **Presets de filtros** - Salvar filtros de cotações, aplicar presets rápidos, filtros automáticos baseados em data/hora
- 🗂️ **Painel de status** - Cartões de status, filtros rápidos e linha do tempo de mudanças de status recentes
- 📝 **Notas de status** - Cada mudança de status com notas opcionais e registro de histórico
- 👁️ **Visualização PDF e modelos** - Visualização PDF integrada, modelos selecionáveis e blocos de branding da empresa
- 🎨 **Biblioteca de cores de filamento** - Mais de 12,000 cores de fábrica com painéis selecionáveis baseados em marca e tipo
- 💾 **Editor de biblioteca de filamentos** - Adicionar/editar baseado em modal, avisos de duplicatas e salvamento persistente em `filamentLibrary.json`
- 🖼️ **Imagens de filamento em PDF** - Exibir logotipos de filamento e amostras de cor em PDFs gerados
- 🧾 **Importação G-code e criação de rascunho** - Carregar exportações G-code/JSON (Prusa, Cura, Orca, Qidi) do modal na calculadora, com resumo detalhado e geração automática de rascunho de cotação
- 📈 **Estatísticas** - Painel de resumo para consumo de filamento, receita, lucro
- 👥 **Base de dados de clientes** - Gestão de clientes com informações de contato, detalhes da empresa e estatísticas de ofertas
- 📊 **Histórico e tendências de preços** - Rastreamento de mudanças de preços de filamento com gráficos e estatísticas
- 🌍 **Multilíngue** - Tradução completa em húngaro, inglês, alemão, francês, chinês simplificado, tcheco, espanhol, italiano, polonês, português, eslovaco, ucraniano e russo (14 idiomas, 850+ chaves de tradução por idioma)
- 💱 **Múltiplas moedas** - EUR, HUF, USD
- 🔄 **Atualizações automáticas** - Verifica GitHub Releases para novas versões
- 🧪 **Versões beta** - Suporte para branch beta e build beta
- ⚙️ **Verificação beta** - Verificação configurável de versões beta
- 🎨 **Layout responsivo** - Todos os elementos da aplicação se adaptam dinamicamente ao tamanho da janela
- ✅ **Diálogos de confirmação** - Solicitação de confirmação antes de excluir
- 🔔 **Notificações toast** - Notificações após operações bem-sucedidas
- 🔍 **Pesquisa e filtragem** - Pesquisar filamentos, impressoras e cotações
- 🔎 **Comparação de preços online** - Um clique abre resultados de pesquisa Google/Bing para o filamento selecionado, preço atualizável instantaneamente
- 📋 **Duplicação** - Duplicação fácil de cotações
- 🖱️ **Arrastar e soltar** - Reordenar cotações, filamentos e impressoras arrastrando
- 📱 **Menus contextuais** - Menus de botão direito para ações rápidas (editar, excluir, duplicar, exportar)

## 📋 Registro de alterações (Changelog)

### v1.1.6 (2025) - 🌍 Cobertura de tradução completa

- 🌍 **Traduções do tutorial** - Adicionadas chaves de tradução do tutorial faltantes a todos os arquivos de idioma:
  - 8 novos passos do tutorial totalmente traduzidos (Painel de status, Visualização PDF, Arrastar e soltar, Menu contextual, Histórico de preços, Comparação de preços online, Exportar/Importar, Backup/Restauração)
  - Todo o conteúdo do tutorial agora está disponível em todos os 14 idiomas suportados
  - Experiência completa do tutorial em tcheco, espanhol, francês, italiano, polonês, português, russo, eslovaco, ucraniano e chinês
- 🎨 **Tradução de nomes de temas** - Os nomes dos temas agora estão totalmente traduzidos em todos os idiomas:
  - 15 nomes de temas adicionados a todos os arquivos de idioma (Claro, Escuro, Azul, Verde, Floresta, Roxo, Laranja, Pastel, Carvão, Meia-noite, Gradiente, Neon, Cyberpunk, Pôr do sol, Oceano)
  - Os nomes dos temas são carregados dinamicamente do sistema de tradução em vez de valores codificados
  - Mecanismo de fallback: chave de tradução → displayName → nome do tema
  - Todos os temas agora são exibidos no idioma selecionado pelo usuário em Configurações

### v1.1.5 (2025) - 🎨 Melhorias de UI e gerenciamento de logs

- 🎨 **Redesign do diálogo de adicionar filamento** - Layout de duas colunas melhorado para melhor organização:
  - Coluna esquerda: Dados básicos (Marca, Tipo, Peso, Preço, Upload de imagem)
  - Coluna direita: Seleção de cor com todas as opções de cor
  - Todos os campos de entrada têm largura consistente
  - Melhor hierarquia visual e espaçamento
  - Upload de imagem movido para a coluna esquerda abaixo do campo Preço
- 📋 **Gerenciamento de arquivos de log** - Nova seção de gerenciamento de logs nas configurações de Gerenciamento de dados:
  - Exclusão automática configurável de arquivos de log antigos (5, 10, 15, 30, 60, 90 dias ou nunca)
  - Botão para abrir a pasta de logs no gerenciador de arquivos
  - Limpeza automática quando a configuração é alterada
  - Abertura de pastas específica da plataforma (macOS, Windows, Linux)
- 📦 **Layout Exportar/Importar** - As seções Exportar e Importar agora estão lado a lado:
  - Layout responsivo de duas colunas
  - Melhor utilização do espaço
  - Equilíbrio visual melhorado
- 🍎 **Aviso de notificação macOS** - Diálogo de aviso descartável:
  - Aparece apenas na plataforma macOS
  - Duas opções de descarte: temporária (botão X) ou permanente (botão Fechar)
  - Descarte temporário: oculto apenas para a sessão atual, reaparece após reinicialização
  - Descarte permanente: salvo nas configurações, nunca aparece novamente
  - Distinção visual clara entre tipos de descarte

### v1.1.4 (2025) - 🐛 Criação automática do arquivo de atualização da biblioteca de filamentos

- 🐛 **Criação automática do arquivo de atualização** - Problema corrigido onde `update_filamentLibrary.json` não era criado automaticamente:
  - O arquivo agora é criado automaticamente a partir de `filamentLibrarySample.json` no primeiro início
  - Garante que o arquivo de atualização esteja sempre disponível para mesclagem
  - Cria apenas se o arquivo não existir (não sobrescreve o existente)
  - Tratamento de erros e registro melhorados para operações de arquivo de atualização

### v1.1.3 (2025) - 🪟 Correções de compatibilidade Windows

- 🪟 **Correção de compatibilidade Windows** - Melhorias no carregamento da biblioteca de filamentos:
  - Importação dinâmica para arquivos JSON grandes (em vez de importação estática)
  - Mecanismo de cache para evitar múltiplas cargas
  - Tratamento de erros melhorado para casos de arquivo não encontrado no Windows
  - Compatibilidade multiplataforma (Windows, macOS, Linux)
- 🔧 **Melhorias no tratamento de erros** - Mensagens de erro aprimoradas:
  - Tratamento adequado de mensagens de erro específicas do Windows
  - Tratamento silencioso de casos de arquivo não encontrado (não como avisos)

### v1.1.2 (2025) - 🌍 Seletor de idioma e melhorias

- 🌍 **Seletor de idioma no primeiro início** - Diálogo moderno e animado de seleção de idioma no primeiro início:
  - Suporte para 13 idiomas com ícones de bandeiras
  - Design consciente do tema
  - Animações suaves
  - O tutorial é executado no idioma selecionado
- 🔄 **Restauração de fábrica** - Função de exclusão completa de dados:
  - Exclui todos os dados armazenados (impressoras, filamentos, ofertas, clientes, configurações)
  - Diálogo de confirmação para operações perigosas
  - O aplicativo reinicia como no primeiro início
- 🎨 **Melhorias de UI**:
  - Correção de contraste do texto do rodapé (seleção de cor dinâmica)
  - Salvamento imediato ao alterar o idioma
  - Posicionamento melhorado de tooltips
- 📚 **Traduções do tutorial** - Tradução completa do tutorial em todos os idiomas suportados (russo, ucraniano, chinês adicionados)

### v1.1.1 (2025) - 🎨 Melhorias de layout do cabeçalho

- 📐 **Reorganização do cabeçalho** - Estrutura de cabeçalho de três partes:
  - Esquerda: Menu + Logo + Título
  - Centro: Breadcrumb (reduz dinamicamente)
  - Direita: Ações rápidas + Cartão de informações de status
- 📊 **Cartão de informações de status** - Estilo compacto e moderno:
  - "Próximo salvamento" (rótulo e valor)
  - Data e hora (empilhadas)
  - Sempre posicionado à direita
- 📱 **Design responsivo** - Pontos de quebra melhorados:
  - Ocultar breadcrumb <1000px
  - Ocultar data <900px
  - Ocultar "Próximo salvamento" <800px
  - Ações rápidas compactas <700px
- 🔢 **Correção de formatação de números** - Arredondamento de percentuais de progresso de carregamento

### v1.1.0 (2025) - 🚀 Atualização de funcionalidades

- 🔍 **Busca global estendida** - Funcionalidade de busca aprimorada:
  - Buscar ofertas por nome do cliente, ID, status e data
  - Buscar filamentos do banco de dados (filamentLibrary) por marca, tipo e cor
  - Adicionar filamentos à lista salva com um clique nos resultados da busca
  - Resultados de busca aprimorados com indicadores de tipo
- 💀 **Sistema de carregamento Skeleton** - Experiência de carregamento espetacular:
  - Componentes skeleton animados com efeitos shimmer
  - Rastreamento de progresso com indicadores visuais
  - Etapas de carregamento com marcas de verificação para etapas concluídas
  - Transições suaves de fade-in
  - Cores skeleton adaptadas ao tema
  - Carregadores skeleton específicos da página
- 🎨 **Melhorias de UI/UX**:
  - Melhores estados de carregamento
  - Feedback do usuário aprimorado durante o carregamento de dados
  - Experiência visual aprimorada

### v1.0.0 (2025) - 🎉 Primeira versão estável

- 🎨 **Componentes UI modernos** - Reforma completa da UI com componentes modernos:
  - Componente Empty State para melhor experiência do usuário
  - Componente Card com efeitos hover
  - Componente Progress Bar para operações de exportação/importação PDF
  - Componente Tooltip com integração de tema
  - Navegação Breadcrumb para hierarquia clara de páginas
- ⚡ **Ações rápidas** - Botões de ação rápida no cabeçalho para fluxo de trabalho mais rápido:
  - Botões de adição rápida para Filamentos, Impressoras e Clientes
  - Botões dinâmicos baseados na página ativa
  - Integração de atalhos de teclado
- 🔍 **Busca global (Command Palette)** - Funcionalidade de busca poderosa:
  - `Ctrl/Cmd+K` para abrir a busca global
  - Buscar páginas e ações rápidas
  - Navegação por teclado (↑↓, Enter, Esc)
  - Estilo adaptado ao tema
- ⏪ **Funcionalidade Desfazer/Refazer** - Gerenciamento de histórico para Filamentos:
  - `Ctrl/Cmd+Z` para desfazer
  - `Ctrl/Cmd+Shift+Z` para refazer
  - Botões visuais desfazer/refazer na UI
  - Suporte a histórico de 50 passos
- ⭐ **Filamentos favoritos** - Marcar e filtrar filamentos favoritos:
  - Ícone de estrela para alternar status favorito
  - Filtro para mostrar apenas favoritos
  - Status favorito persistente
- 📦 **Operações em massa** - Gerenciamento eficiente em massa:
  - Seleção por checkbox para múltiplos filamentos
  - Funcionalidade Selecionar tudo / Desmarcar tudo
  - Exclusão em massa com diálogo de confirmação
  - Indicadores visuais de seleção
- 🎨 **Diálogos modais** - Experiência modal moderna:
  - Modais com fundo desfocado para formulários de adicionar/editar
  - Campos de entrada de tamanho fixo
  - Tecla Escape para fechar
  - Animações suaves com framer-motion
- ⌨️ **Atalhos de teclado** - Sistema de atalhos aprimorado:
  - Atalhos de teclado personalizáveis
  - Diálogo de ajuda de atalhos (`Ctrl/Cmd+?`)
  - Editar atalhos com captura de teclas
  - Armazenamento persistente de atalhos
- 📝 **Sistema de registro** - Registro abrangente:
  - Arquivos de log separados para frontend e backend
  - Resolução de diretório de log independente de plataforma
  - Rotação automática de logs
  - Integração de console
- 🔔 **Melhorias de notificações** - Melhor sistema de notificações:
  - Nome do cliente em notificações de exclusão de oferta
  - Suporte a notificações multiplataforma
  - Tratamento de erros aprimorado
- 🎯 **Melhorias UI/UX**:
  - Tamanhos de campos de entrada fixos
  - Melhores layouts de formulários
  - Integração de tema aprimorada
  - Acessibilidade aprimorada

### v0.6.0 (2025)

#### 🐛 Correções de bugs
- **Otimização de registro**: Redução de registros excessivos e duplicados
  - Registros informativos aparecem apenas no modo de desenvolvimento (DEV)
  - Erros ainda são registrados em builds de produção
  - Inicialização do FilamentLibrary ocorre silenciosamente
- **Correção de avisos falsos**: A resolução de cor do filamento avisa apenas quando a biblioteca já está carregada e a cor ainda não foi encontrada
  - Previne avisos falsos durante o carregamento assíncrono da biblioteca
  - Avisos aparecem apenas para problemas reais
- **Correção de duplicação do verificador de atualizações**: Remoção de chamadas duplicadas de verificação de atualizações
- **Correção de registro de atalhos de teclado**: Registra apenas quando existe um atalho, ignora combinações inválidas

#### ⚡ Melhorias de desempenho
- Registro de operações de armazenamento otimizado (apenas modo DEV)
- Menos operações de console em builds de produção
- Saída de console mais limpa durante o desenvolvimento

## 📸 Capturas de tela

A aplicação inclui:
- Painel inicial com estatísticas
- Gestão de filamentos
- Gestão de impressoras
- Calculadora de cálculo de custos
- Lista de cotações e visualização detalhada
- Painel de status e linha do tempo
- Exportação PDF e visualização integrada

## 🚀 Instalação

### Pré-requisitos

- **Rust**: [Instalar Rust](https://rustup.rs/)
- **Node.js**: [Instalar Node.js](https://nodejs.org/) (versão 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Específico para macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Específico para Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Específico para Windows

- Visual Studio Build Tools (ferramentas de compilação C++)
- Windows SDK

## 📦 Compilação

### Execução em modo de desenvolvimento

```bash
cd src-tauri
cargo tauri dev
```

### Build de produção (Criar aplicação standalone)

```bash
cd src-tauri
cargo tauri build
```

A aplicação standalone estará localizada em:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` ou `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Build beta

O projeto inclui um branch `beta` configurado para builds separados:

```bash
# Mudar para branch beta
git checkout beta

# Build beta local
./build-frontend.sh
cd src-tauri
cargo tauri build
```

O build beta define automaticamente a variável `VITE_IS_BETA=true`, então "BETA" aparece no menu.

**GitHub Actions**: Ao fazer push para o branch `beta`, o workflow `.github/workflows/build-beta.yml` é executado automaticamente, compilando a versão beta para todas as três plataformas.

Guia detalhado: [BUILD.md](BUILD.md) e [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Desenvolvimento

### Estrutura do projeto

```
3DPrinterCalcApp/
├── frontend/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── utils/        # Funções auxiliares
│   │   └── types.ts      # Tipos TypeScript
│   └── package.json
├── src-tauri/         # Backend Rust
│   ├── src/           # Código-fonte Rust
│   ├── Cargo.toml     # Dependências Rust
│   └── tauri.conf.json # Configuração Tauri
└── README.md
```

### Desenvolvimento frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Dependências

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (armazenamento de dados)
- tauri-plugin-log (registro)

## 📖 Uso

1. **Adicionar impressora**: Menu Impressoras → Adicionar nova impressora
2. **Adicionar filamento**: Menu Filamentos → Adicionar novo filamento
3. **Calcular custo**: Menu Calculadora → Selecionar impressora e filamentos
4. **Salvar cotação**: Clique no botão "Salvar como cotação" na calculadora
5. **Exportar PDF**: Menu Cotações → Selecionar uma cotação → Exportar PDF
6. **Verificar versões beta**: Menu Configurações → Habilitar opção "Verificar atualizações beta"

## 🔄 Gerenciamento de versões e atualizações

A aplicação verifica automaticamente GitHub Releases para novas versões:

- **Ao iniciar**: Verifica automaticamente atualizações
- **A cada 5 minutos**: Verifica automaticamente novamente
- **Notificação**: Se uma nova versão estiver disponível, uma notificação aparece no canto superior direito

### Verificação de versões beta

Para verificar versões beta:

1. Vá para o menu **Configurações**
2. Habilite a opção **"Verificar atualizações beta"**
3. A aplicação verifica imediatamente as versões beta
4. Se uma versão beta mais recente estiver disponível, uma notificação aparece
5. Clique no botão "Baixar" para ir para a página GitHub Release

**Exemplo**: Se você estiver usando uma versão RELEASE (ex: 0.1.0) e habilitar a verificação beta, a aplicação encontra a versão beta mais recente (ex: 0.2.0-beta) e notifica você se houver uma mais recente.

Guia detalhado: [VERSIONING.md](VERSIONING.md)

## 🛠️ Stack tecnológico

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Armazenamento de dados**: Tauri Store Plugin (arquivos JSON)
- **Estilização**: Estilos inline (commonStyles)
- **i18n**: Sistema de tradução personalizado
- **CI/CD**: GitHub Actions (builds automáticos para macOS, Linux, Windows)
- **Gerenciamento de versões**: Integração com API GitHub Releases

## 📝 Licença

Este projeto está licenciado sob **licença MIT**, no entanto, **uso comercial requer permissão**.

Copyright completo da aplicação: **Lekszikov Miklós (LexyGuru)**

- ✅ **Uso pessoal e educacional**: Permitido
- ❌ **Uso comercial**: Apenas com permissão escrita explícita

Detalhes: arquivo [LICENSE](LICENSE)

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Agradecimentos

- [Tauri](https://tauri.app/) - O framework de aplicações desktop multiplataforma
- [React](https://react.dev/) - O framework frontend
- [Vite](https://vitejs.dev/) - A ferramenta de build

## 📚 Documentação adicional

- [BUILD.md](BUILD.md) - Guia detalhado de build para todas as plataformas
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Criar aplicação standalone
- [VERSIONING.md](VERSIONING.md) - Gerenciamento de versões e atualizações
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Criar primeiro GitHub Release

## 🌿 Estrutura de branches

- **`main`**: Versões de release estáveis (build RELEASE)
- **`beta`**: Versões beta e desenvolvimento (build BETA)

Ao fazer push para o branch `beta`, o workflow GitHub Actions é executado automaticamente, compilando a versão beta.

## 📋 Histórico de versões

### v1.1.1 (2025) - 🎨 Melhorias no layout do cabeçalho

- 🎨 **Redesign do cabeçalho** - Revisão completa do layout do cabeçalho:
  - Estrutura de três seções (esquerda: logo/menu, centro: breadcrumb, direita: ações/status)
  - Cartão de informações de status sempre posicionado à extrema direita
  - Design moderno tipo cartão para informações de status
  - Melhor espaçamento e alinhamento em todo o cabeçalho
- 📱 **Design responsivo** - Melhor experiência em dispositivos móveis e telas pequenas:
  - Pontos de quebra dinâmicos para visibilidade dos elementos
  - Correções de truncamento do breadcrumb
  - Ações rápidas se adaptam ao tamanho da tela
  - Dimensionamento responsivo do cartão de informações de status
- 🔧 **Correções de layout**:
  - Problemas de overflow e truncamento do breadcrumb corrigidos
  - Melhorias no posicionamento do cartão de informações de status
  - Melhor gerenciamento do layout flexbox
  - Espaçamento e gaps melhorados entre elementos

### v1.1.0 (2025) - 🚀 Atualização de funcionalidades

- 🔍 **Busca global estendida** - Funcionalidade de busca aprimorada
- 💀 **Sistema de carregamento Skeleton** - Experiência de carregamento espetacular
- 🎨 **Melhorias de UI/UX** - Melhores estados de carregamento e experiência visual

### v1.0.0 (2025) - 🎉 Primeira versão estável

- 🎨 **Componentes UI modernos** - Renovação completa da UI com componentes modernos
- ⚡ **Ações rápidas** - Botões de ação rápida no cabeçalho
- 🔍 **Busca global** - Funcionalidade de busca poderosa
- ⏪ **Funcionalidade Desfazer/Refazer** - Gerenciamento de histórico
- ⭐ **Filamentos favoritos** - Marcar e filtrar filamentos favoritos
- 📦 **Operações em massa** - Gerenciamento em massa eficiente
- 🎨 **Diálogos modais** - Experiência modal moderna
- ⌨️ **Atalhos de teclado** - Sistema de atalhos aprimorado
- 📝 **Sistema de registro** - Registro abrangente
- 🔔 **Melhorias de notificações** - Melhor sistema de notificações

### v0.6.0 (2025)

- 👥 **Base de dados de clientes** - Sistema completo de gestão de clientes com:
  - Adicionar, editar, excluir clientes
  - Informações de contato (e-mail, telefone)
  - Detalhes da empresa (opcional)
  - Endereço e notas
  - Estatísticas de clientes (total de ofertas, data da última oferta)
  - Funcionalidade de pesquisa
  - Integração com Calculadora para seleção rápida de clientes
- 📊 **Histórico e tendências de preços** - Rastreamento de mudanças de preços de filamento:
  - Rastreamento automático do histórico de preços quando os preços do filamento são atualizados
  - Visualização de tendências de preços com gráficos SVG
  - Estatísticas de preços (preço atual, médio, mínimo, máximo)
  - Análise de tendências (aumentando, diminuindo, estável)
  - Tabela de histórico de preços com informações detalhadas de mudanças
  - Avisos de mudanças significativas de preços (mudanças de 10%+)
  - Visualização do histórico de preços no componente Filamentos durante a edição
- 🔧 **Melhorias**:
  - Calculadora aprimorada com menu suspenso de seleção de clientes
  - Integração do histórico de preços no formulário de edição de filamento
  - Persistência de dados aprimorada para clientes e histórico de preços

### v0.5.58 (2025)
- 🌍 **Suporte para idiomas ucraniano e russo** – Adicionado suporte completo de tradução para ucraniano (uk) e russo (ru):
  - Arquivos de tradução completos com todas as 813 chaves de tradução para ambos os idiomas
  - Suporte de locale ucraniano (uk-UA) para formatação de data/hora
  - Suporte de locale russo (ru-RU) para formatação de data/hora
  - Todos os arquivos README atualizados com novos idiomas no menu de idiomas
  - Contagem de idiomas atualizada de 12 para 14 idiomas
  - Arquivos de documentação README.uk.md e README.ru.md criados

### v0.5.57 (2025)
- 🍎 **Platform-Specific Features** – Native platform integration for macOS, Windows, and Linux:
  - **macOS**: Dock badge support (numeric/textual badge on app icon), native Notification Center integration with permission management
  - **Windows**: Native Windows notifications
  - **Linux**: System tray integration, desktop notifications support
  - **All Platforms**: Native notification API integration with permission request system, platform detection and automatic feature enabling
- 🔔 **Notification System** – Native notification support with permission management:
  - Permission request system for macOS notifications
  - Notification test buttons in Settings
  - Automatic permission checking and status display
  - Platform-specific notification handling (macOS Notification Center, Windows Action Center, Linux desktop notifications)

### v0.5.56 (2025)
- 🌍 **Traduções completas de idiomas** – Completadas as traduções completas para 6 arquivos de idioma restantes: tcheco (cs), espanhol (es), italiano (it), polonês (pl), português (pt) e eslovaco (sk). Cada arquivo contém todas as 813 chaves de tradução, então a aplicação agora está totalmente suportada nesses idiomas.
- 🔒 **Correção de permissões Tauri** – O arquivo `update_filamentLibrary.json` agora está explicitamente habilitado para operações de leitura, escrita e criação no arquivo de capacidades Tauri, garantindo que as atualizações da biblioteca de filamentos funcionem de forma confiável.

### v0.5.55 (2025)
- 🧵 **Melhoria de edição de cotações** – As cotações salvas agora permitem seleção ou modificação direta da impressora, com custos recalculados automaticamente junto com as mudanças de filamento.
- 🧮 **Precisão e registro** – O registro detalhado ajuda a rastrear as etapas do cálculo de custos (filamento, eletricidade, secagem, uso), facilitando a busca de erros em arquivos G-code importados.
- 🌍 **Adições de tradução** – Novas chaves e rótulos i18n adicionados para o seletor de impressora, garantindo uma UI de editor consistente em todos os idiomas suportados.
- 📄 **Atualização de documentação** – README expandido com descrição de novos recursos, release v0.5.55 adicionado ao histórico de versões.

### v0.5.11 (2025)
- 🗂️ **Modularização de idiomas** – Expansão do aplicativo com arquivos de tradução organizados em um novo diretório `languages/`, facilitando a adição de novos idiomas e o gerenciamento de textos existentes.
- 🌍 **Traduções UI unificadas** – A interface de importação do slicer agora funciona a partir do sistema de tradução central, com todos os botões, mensagens de erro e resumos localizados.
- 🔁 **Atualização do seletor de idioma** – Em Configurações, o seletor de idioma carrega com base em arquivos de idioma descobertos, então no futuro basta adicionar um novo arquivo de idioma.
- 🌐 **Novas bases de idiomas** – Arquivos de tradução preparados para francês, italiano, espanhol, polonês, tcheco, eslovaco, português brasileiro e chinês simplificado (com fallback em inglês), as traduções reais podem ser facilmente preenchidas.

### v0.5.0 (2025)
- 🔎 **Botão de comparação de preços de filamento** – Cada filamento personalizado agora tem um ícone de lupa que abre a pesquisa Google/Bing com base em marca/tipo/cor, fornecendo links rápidos para preços atuais.
- 💶 **Suporte a preço decimal** – Os campos de preço de filamento agora aceitam decimais (14.11 € etc.), a entrada é automaticamente validada e formatada ao salvar.
- 🌐 **Pesquisa reversa fallback** – Se o shell Tauri não puder abrir o navegador, o aplicativo abre automaticamente uma nova aba, então a pesquisa funciona em todas as plataformas.

### v0.4.99 (2025)
- 🧾 **Importação G-code integrada na calculadora** – Novo modal `SlicerImportModal` no topo da calculadora que carrega exportações G-code/JSON com um clique, transferindo tempo de impressão, quantidade de filamento e criando um rascunho de cotação.
- 📊 **Dados do slicer do cabeçalho** – Os valores do cabeçalho G-code `total filament weight/length/volume` assumem automaticamente os resumos, lidando com precisão as perdas de mudança de cor.

### v0.4.98 (2025)
- 🧵 **Suporte a filamento multicolor** – A biblioteca de filamentos e a UI de gerenciamento agora marcam separadamente filamentos multicolor (arco-íris/dual/tricolor) com notas e visualização de arco-íris.
- 🌐 **Tradução automática na importação CSV** – Nomes de cores importados de banco de dados externo recebem rótulos húngaros e alemães, mantendo o seletor de cores multilíngue sem edição manual.
- 🔄 **Mesclagem de biblioteca de atualização** – O conteúdo do arquivo `update_filamentLibrary.json` é automaticamente deduplicado e mesclado com a biblioteca existente na inicialização, sem sobrescrever modificações do usuário.
- 📁 **Atualização do conversor CSV** – O script `convert-filament-csv.mjs` não sobrescreve mais o `filamentLibrary.json` persistente, em vez disso cria um arquivo de atualização e gera rótulos multilíngues.
- ✨ **Ajuste da experiência de animação** – Novas opções de transição de página (flip, parallax), seletor de estilo de microinteração, feedback pulsante, lista esqueleto da biblioteca de filamentos e efeitos hover de cartão ajustados.
- 🎨 **Extensões da oficina de temas** – Quatro novos temas integrados (Forest, Pastel, Charcoal, Midnight), duplicação instantânea do tema ativo para edição personalizada, tratamento melhorado de gradiente/contraste e processo de compartilhamento simplificado.

### v0.4.0 (2025)
- 🧵 **Integração de banco de dados de filamentos** – Mais de 2.000 cores de fábrica da biblioteca JSON integrada (instantâneo filamentcolors.xyz), organizadas por marca e material
- 🪟 **Painéis de seletor de tamanho fixo** – Listas de marca e tipo abertas com botão, pesquisáveis, roláveis que se excluem mutuamente, tornando o formulário mais transparente
- 🎯 **Melhorias do seletor de cores** – Quando os itens da biblioteca são reconhecidos, o acabamento e o código hexadecimal são definidos automaticamente, campos separados disponíveis ao alternar para o modo personalizado
- 💾 **Editor da biblioteca de filamentos** – Nova aba de configurações com formulário popup, tratamento de duplicatas e salvamento persistente `filamentLibrary.json` baseado em Tauri FS
- 📄 **Atualização da documentação** – Novo ponto na lista principal de recursos para a biblioteca de cores de filamentos, limpeza README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Predefinições de filtro de cotações** – Configurações de filtro salváveis e nomeáveis, predefinições rápidas padrão (Hoje, Ontem, Semanal, Mensal etc.) e aplicar/excluir com um clique
- 📝 **Notas de mudança de status** – Novo modal para modificação de status de cotação com nota opcional que é armazenada no histórico de status
- 🖼️ **Extensão de exportação PDF** – Imagens armazenadas com filamentos aparecem na tabela PDF com estilo otimizado para impressão
- 🧾 **Folha de dados de marca da empresa** – Nome da empresa, endereço, ID fiscal, conta bancária, contato e upload de logotipo; incluído automaticamente no cabeçalho PDF
- 🎨 **Seletor de modelo PDF** – Três estilos (Moderno, Minimalista, Profissional) para escolher a aparência da cotação
- 👁️ **Visualização PDF integrada** – Botão separado nos detalhes da cotação para verificação visual instantânea antes da exportação
- 📊 **Painel de status** – Cartões de status com resumo, filtros rápidos de status e linha do tempo de mudanças de status recentes nas cotações
- 📈 **Gráficos estatísticos** – Gráfico de tendência receita/custo/lucro, gráfico de pizza de distribuição de filamentos, gráfico de barras de receita por impressora, tudo exportável em formato SVG/PNG e também pode ser salvo como PDF

### v0.3.8 (2025)
- 🐛 **Correção de formatação de números do relatório** - Formatação para 2 casas decimais nos relatórios:
  - Cartões de estatísticas principais (Receita, Despesas, Lucro, Cotações): `formatNumber(formatCurrency(...), 2)`
  - Valores acima dos gráficos: `formatNumber(formatCurrency(...), 2)`
  - Estatísticas detalhadas (Lucro médio/cotação): `formatNumber(formatCurrency(...), 2)`
  - Agora consistente com a página inicial (ex. `6.45` em vez de `6.45037688333333`)
- 🎨 **Correção de navegação de abas de configurações** - Melhorias de cor de fundo e texto:
  - Fundo da seção de navegação de abas: `rgba(255, 255, 255, 0.85)` para temas de gradiente + `blur(10px)`
  - Fundos dos botões de aba: Ativo `rgba(255, 255, 255, 0.9)`, inativo `rgba(255, 255, 255, 0.7)` para temas de gradiente
  - Cor do texto dos botões de aba: `#1a202c` (escuro) para temas de gradiente para legibilidade
  - Efeitos hover: `rgba(255, 255, 255, 0.85)` para temas de gradiente
  - Filtro de fundo: `blur(8px)` para botões de aba, `blur(10px)` para seção de navegação

### v0.3.7 (2025)
- 🎨 **Modernização do design** - Transformação visual completa com animações e novos temas:
  - Novos temas: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 novos temas modernos)
  - Animações Framer Motion integradas (fadeIn, slideIn, stagger, efeitos hover)
  - Efeito glassmorphism para temas de gradiente (desfoque + fundo transparente)
  - Efeito de brilho neon para temas neon/cyberpunk
  - Cartões e superfícies modernizados (padding maior, cantos arredondados, sombras melhores)
- 🎨 **Melhorias de cor** - Melhor contraste e legibilidade para todos os temas:
  - Texto escuro (#1a202c) em fundo branco/claro para temas de gradiente
  - Campos de entrada, rótulos, coloração h3 melhorada em todos os componentes
  - Tratamento de cor consistente em todas as páginas (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Sombra de texto adicionada para temas de gradiente para melhor legibilidade
- 📊 **Melhorias de estilo de tabela** - Fundo mais desfocado e melhor contraste de texto:
  - Cor de fundo: rgba(255, 255, 255, 0.85) para temas de gradiente (anteriormente 0.95)
  - Filtro de fundo: blur(8px) para efeito mais desfocado
  - Cor do texto: #333 (cinza escuro) para temas de gradiente para melhor legibilidade
  - Fundos de células: rgba(255, 255, 255, 0.7) para efeito mais desfocado
- 🎨 **Melhorias de cor de fundo dos cartões** - Fundo mais desfocado, melhor legibilidade:
  - Cor de fundo: rgba(255, 255, 255, 0.75) para temas de gradiente (anteriormente 0.95)
  - Filtro de fundo: blur(12px) para desfoque mais forte
  - Opacidade: 0.85 para efeito fosco
  - Cor do texto: #1a202c (escuro) para temas de gradiente
- 📈 **Modernização da página inicial** - Estatísticas semanais/mensais/anuais e comparação de períodos:
  - Cartões de comparação de períodos (Semanal, Mensal, Anual) com barras de destaque coloridas
  - Componentes StatCard modernizados (ícones com fundos coloridos, barras de destaque)
  - Seção de resumo organizada em cartões com ícones
  - Seção de comparação de períodos adicionada
- 🐛 **Correção de filtro de data** - Filtragem de período mais precisa:
  - Reset de tempo (00:00:00) para comparação precisa
  - Limite superior definido (hoje está incluído)
  - Semanal: últimos 7 dias (hoje incluído)
  - Mensal: últimos 30 dias (hoje incluído)
  - Anual: últimos 365 dias (hoje incluído)
- 🎨 **Modernização da barra lateral** - Ícones, glassmorphism, efeitos de brilho neon
- 🎨 **Modernização do ConfirmDialog** - Prop de tema adicionada, coloração harmonizada

### v0.3.6 (2025)
- 🎨 **Reorganização da UI de configurações** - Sistema de abas (Geral, Aparência, Avançado, Gerenciamento de dados) para melhor UX e navegação mais limpa
- 🌐 **Melhorias de tradução** - Todo o texto húngaro codificado traduzido em todos os componentes (HU/EN/DE):
  - Calculator: "cálculo de custos de impressão 3D"
  - Filaments: "Gerenciar e editar filamentos"
  - Printers: "Gerenciar impressoras e sistemas AMS"
  - Offers: "Gerenciar e exportar cotações salvas"
  - Home: Títulos de estatísticas, resumo, rótulos de exportação CSV (hora/Std/hrs, unid/Stk/pcs)
  - VersionHistory: "Nenhum histórico de versões disponível"
- 💾 **Sistema de cache de histórico de versões** - Salvamento físico no localStorage, verificação do GitHub a cada 1 hora:
  - Detecção de mudanças baseada em checksum (baixa apenas em novos lançamentos)
  - Cache separado por idioma (Húngaro/Inglês/Alemão)
  - Troca rápida de idioma do cache (sem retradução)
  - Invalidação automática de cache em novo lançamento
- 🌐 **Tradução inteligente** - Traduz apenas novos lançamentos, usa traduções antigas do cache:
  - Validação de cache (não fazer cache se mesmo texto)
  - API MyMemory fallback se a tradução falhar
  - Auto-reset do contador de erros (reseta após 5 minutos)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate removido** - Apenas uso da API MyMemory (erros 400 eliminados, solicitação GET, sem CORS)
- 🔄 **Refatoração do botão de repetir** - Mecanismo de acionamento mais simples com useEffect
- 🐛 **Correções de erros de compilação** - Problemas de indentação JSX corrigidos (seção Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integração da API MyMemory** - API de tradução gratuita em vez de LibreTranslate
- ✅ **Abertura da página de lançamentos do GitHub** - Botão para abrir a página de lançamentos do GitHub no limite de taxa
- ✅ **Melhoria do tratamento de erros de limite de taxa** - Mensagens de erro claras e botão de repetir
- 🐛 **Correções de erros de compilação** - Imports não utilizados removidos (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Melhoria de validação de entrada** - Utilitário de validação central criado e integrado nos componentes Calculator, Filaments, Printers
- ✅ **Mensagens de erro de validação** - Mensagens de erro multilíngues (HU/EN/DE) com notificações toast
- ✅ **Otimização de desempenho** - Componentes lazy loading (divisão de código), otimização useMemo e useCallback
- ✅ **Inicialização específica da plataforma** - Fundamentos de inicialização específica da plataforma macOS, Windows, Linux
- 🐛 **Correção de erro de compilação** - Funções de menu contextual Printers.tsx adicionadas

### v0.3.3 (2025)
- 🖱️ **Recursos de arrastar e soltar** - Reordenar cotações, filamentos e impressoras arrastando
- 📱 **Menus contextuais** - Menus de clique direito para ações rápidas (editar, excluir, duplicar, exportar PDF)
- 🎨 **Feedback visual** - Mudança de opacidade e cursor durante arrastar e soltar
- 🔔 **Notificações toast** - Notificações após reordenação
- 🐛 **Correção de erro de compilação** - Correção Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Recursos de modelo** - Salvar e carregar cálculos como modelos no componente Calculator
- 📜 **Histórico/Versionamento para cotações** - Versionamento de cotações, visualizar histórico, rastrear mudanças
- 🧹 **Correção de duplicação** - Funções de exportação/importação CSV/JSON duplicadas removidas dos componentes Filaments e Printers (permaneceram em Settings)

### v0.3.1 (2025)
- ✅ **Melhoria de validação de entrada** - Números negativos desabilitados, valores máximos definidos (peso do filamento, tempo de impressão, potência, etc.)
- 📊 **Exportação/Importação CSV/JSON** - Exportação/importação em massa de filamentos e impressoras em formato CSV e JSON
- 📥 **Botões Importar/Exportar** - Acesso fácil às funções de exportação/importação nas páginas Filaments e Printers
- 🎨 **Melhoria de estados vazios** - Estados vazios informativos exibidos quando não há dados

### v0.3.0 (2025)
- ✏️ **Edição de cotações** - Editar cotações salvas (nome do cliente, contato, descrição, percentual de lucro, filamentos)
- ✏️ **Editar filamentos na cotação** - Modificar, adicionar, excluir filamentos dentro da cotação
- ✏️ **Botão de edição** - Novo botão de edição ao lado do botão excluir na lista de cotações
- 📊 **Função de exportação de estatísticas** - Exportar estatísticas em formato JSON ou CSV da página inicial
- 📈 **Geração de relatórios** - Gerar relatórios semanais/mensais/anuais/todos em formato JSON com filtragem de período
- 📋 **Exibição do histórico de versões** - Visualizar histórico de versões em configurações, integração da API GitHub Releases
- 🌐 **Tradução de lançamentos do GitHub** - Tradução automática Húngaro -> Inglês/Alemão (API MyMemory)
- 💾 **Cache de tradução** - Cache localStorage para notas de lançamento traduzidas
- 🔄 **Histórico de versões dinâmico** - Versões beta e release exibidas separadamente
- 🐛 **Correções de bugs** - Variáveis não utilizadas removidas, limpeza de código, erros de linter corrigidos

### v0.2.55 (2025)
- 🖥️ **Função Console/Log** - Novo item de menu Console para depuração e visualização de logs
- 🖥️ **Configuração do Console** - Pode habilitar a exibição do item de menu Console em configurações
- 📊 **Coleta de logs** - Gravação automática de todas as mensagens console.log, console.error, console.warn
- 📊 **Gravação de erros globais** - Gravação automática de eventos de erro de janela e rejeições de promessa não tratadas
- 🔍 **Filtragem de logs** - Filtrar por nível (all, error, warn, info, log, debug)
- 🔍 **Exportação de logs** - Exportar logs em formato JSON
- 🧹 **Exclusão de logs** - Excluir logs com um botão
- 📜 **Auto-scroll** - Rolagem automática para novos logs
- 💾 **Registro completo** - Todas as operações críticas registradas (salvar, exportar, importar, excluir, exportar PDF, baixar atualização)
- 🔄 **Correção do botão de atualização** - O botão de download agora usa o plugin shell Tauri, funciona de forma confiável
- 🔄 **Registro de atualização** - Registro completo de verificação e download de atualização
- ⌨️ **Atalhos de teclado** - `Ctrl/Cmd+N` (novo), `Ctrl/Cmd+S` (salvar), `Escape` (cancelar), `Ctrl/Cmd+?` (ajuda)
- ⌨️ **Correção de atalhos de teclado macOS** - Tratamento de Cmd vs Ctrl, tratamento de eventos de fase de captura
- ⏳ **Estados de carregamento** - Componente LoadingSpinner para estados de carregamento
- 💾 **Backup e restauração** - Backup e restauração completa de dados com diálogo Tauri e plugins fs
- 🛡️ **Limites de erro** - React ErrorBoundary para tratamento de erros em nível de aplicativo
- 💾 **Salvamento automático** - Salvamento automático com limite de tempo com intervalo configurável (padrão 30 segundos)
- 🔔 **Configurações de notificação** - Notificações toast ligado/desligado e configuração de duração
- ⌨️ **Menu de ajuda de atalhos** - Lista de atalhos de teclado em janela modal (`Ctrl/Cmd+?`)
- 🎬 **Animações e transições** - Transições suaves e animações de quadros-chave (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Ajuda contextual para todos os elementos importantes ao passar o mouse
- 🐛 **Correção de erro de renderização React** - Operação assíncrona do logger do console para que não bloqueie a renderização
- 🔧 **Atualização num-bigint-dig** - Atualizado para v0.9.1 (correção de aviso de depreciação)

### v0.2.0 (2025)
- 🎨 **Sistema de temas** - 6 temas modernos (Claro, Escuro, Azul, Verde, Roxo, Laranja)
- 🎨 **Seletor de temas** - Tema selecionável em configurações, entra em vigor imediatamente
- 🎨 **Integração completa de temas** - Todos os componentes (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) usam temas
- 🎨 **Cores dinâmicas** - Todas as cores codificadas substituídas por cores do tema
- 🎨 **Tema responsivo** - As cotações e o rodapé da Sidebar também usam temas
- 💱 **Conversão de moeda dinâmica** - As cotações agora são exibidas na moeda das configurações atuais (conversão automática)
- 💱 **Mudança de moeda** - A moeda alterada em configurações afeta imediatamente a exibição de cotações
- 💱 **Conversão de moeda PDF** - A exportação PDF também é criada na moeda das configurações atuais
- 💱 **Conversão de preço de filamento** - Os preços dos filamentos também são convertidos automaticamente

### v0.1.85 (2025)
- 🎨 **Melhorias UI/UX**:
  - ✏️ Ícones duplicados removidos (Botões Editar, Salvar, Cancelar)
  - 📐 Seções Exportar/Importar em layout de 2 colunas (lado a lado)
  - 💾 Diálogo de salvamento nativo usado para salvar PDF (diálogo Tauri)
  - 📊 Notificações toast para salvar PDF (sucesso/erro)
  - 🖼️ Tamanho da janela do aplicativo: 1280x720 (anteriormente 1000x700)
- 🐛 **Correções de bugs**:
  - Informações ausentes adicionadas na geração PDF (customerContact, lucro em linha separada, receita)
  - Chaves de tradução adicionadas (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Melhorias de exportação PDF**:
  - Contato do cliente (e-mail/telefone) exibido no PDF
  - Cálculo de lucro em linha separada com percentual de lucro
  - Receita (Preço Total) em linha separada, destacado
  - Divisão completa de custos no PDF

### v0.1.56 (2025)
- ✨ **Melhorias de layout da calculadora**: Transbordamento de cartões de filamento corrigido, layout flexbox responsivo
- ✨ **Divisão de custos responsiva**: Agora responde dinamicamente a mudanças no tamanho da janela
- 🐛 **Correção de bug**: O conteúdo não transborda da janela ao adicionar filamento
- 🐛 **Correção de bug**: Todos os elementos Calculator respondem corretamente a mudanças no tamanho da janela

### v0.1.55 (2025)
- ✨ **Diálogos de confirmação**: Confirmação solicitada antes da exclusão (Filamentos, Impressoras, Cotações)
- ✨ **Notificações toast**: Notificações após operações bem-sucedidas (adicionar, atualizar, excluir)
- ✨ **Validação de entrada**: Números negativos desabilitados, valores máximos definidos
- ✨ **Estados de carregamento**: Spinner de carregamento na inicialização do aplicativo
- ✨ **Limite de erro**: Tratamento de erros em nível de aplicativo
- ✨ **Pesquisa e filtro**: Pesquisar filamentos, impressoras e cotações
- ✨ **Duplicação**: Duplicação fácil de cotações
- ✨ **Formulários recolhíveis**: Os formulários de adicionar filamento e impressora são recolhíveis
- ✨ **Extensões de cotação**: Campos de nome do cliente, contato e descrição adicionados
- 🐛 **Limpeza Console.log**: Nenhum console.logs na compilação de produção
- 🐛 **Correção do campo de descrição**: Textos longos se envolvem corretamente.

---

**Versão**: 1.1.6

Se você tiver alguma dúvida ou encontrar um bug, por favor abra uma issue no repositório GitHub!

