# 🖨️ 3D Printer Calculator App

> **🌍 Seleção de idioma**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

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
- 🎨 **Biblioteca de cores de filamento** - Mais de 2000 cores de fábrica com painéis selecionáveis baseados em marca e tipo
- 💾 **Editor de biblioteca de filamentos** - Adicionar/editar baseado em modal, avisos de duplicatas e salvamento persistente em `filamentLibrary.json`
- 🖼️ **Imagens de filamento em PDF** - Exibir logotipos de filamento e amostras de cor em PDFs gerados
- 🧾 **Importação G-code e criação de rascunho** - Carregar exportações G-code/JSON (Prusa, Cura, Orca, Qidi) do modal na calculadora, com resumo detalhado e geração automática de rascunho de cotação
- 📈 **Estatísticas** - Painel de resumo para consumo de filamento, receita, lucro
- 🌍 **Multilíngue** - Tradução completa em húngaro, inglês, alemão, francês, chinês simplificado, tcheco, espanhol, italiano, polonês, português e eslovaco (12 idiomas, 813 chaves de tradução por idioma)
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

### v0.5.56 (2025)
- 🌍 **Traduções completas de idiomas** – Completadas as traduções completas para 6 arquivos de idioma restantes: tcheco (cs), espanhol (es), italiano (it), polonês (pl), português (pt) e eslovaco (sk). Cada arquivo contém todas as 813 chaves de tradução, então a aplicação agora está totalmente suportada nesses idiomas.
- 🔒 **Correção de permissões Tauri** – O arquivo `update_filamentLibrary.json` agora está explicitamente habilitado para operações de leitura, escrita e criação no arquivo de capacidades Tauri, garantindo que as atualizações da biblioteca de filamentos funcionem de forma confiável.

### v0.5.55 (2025)
- 🧵 **Melhoria de edição de cotações** – As cotações salvas agora permitem seleção ou modificação direta da impressora, com custos recalculados automaticamente junto com as mudanças de filamento.
- 🧮 **Precisão e registro** – O registro detalhado ajuda a rastrear as etapas do cálculo de custos (filamento, eletricidade, secagem, uso), facilitando a busca de erros em arquivos G-code importados.
- 🌍 **Adições de tradução** – Novas chaves e rótulos i18n adicionados para o seletor de impressora, garantindo uma UI de editor consistente em todos os idiomas suportados.
- 📄 **Atualização de documentação** – README expandido com descrição de novos recursos, release v0.5.55 adicionado ao histórico de versões.

---

**Versão**: 0.5.56

Se você tiver alguma dúvida ou encontrar um bug, por favor abra uma issue no repositório GitHub!

