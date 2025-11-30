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
- 💱 **Múltiplas moedas** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 moedas)
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

## 🌿 Estrutura de branches

- **`main`**: Versões de release estáveis (build RELEASE)
- **`beta`**: Versões beta e desenvolvimento (build BETA)

Ao fazer push para o branch `beta`, o workflow GitHub Actions é executado automaticamente, compilando a versão beta.

## 📋 Histórico de versões

For detailed version history and changelog, please see [RELEASE.pt.md](RELEASE.pt.md).

---

**Versão**: 1.6.0

Se você tiver alguma dúvida ou encontrar um bug, por favor abra uma issue no repositório GitHub!

