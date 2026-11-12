# Pokapi — Pokédex

## Abordagem

Aplicação React responsiva servida pelo starter web-db-user, sem login e sem persistência de servidor. Os dados são consultados diretamente na PokéAPI pública no navegador e favoritos são persistidos em `localStorage`. A tela inicial usa uma transição de entrada independente para apresentar a marca e o Pikachu antes de revelar a exploração.

## Estrutura

- `client/src/pages/Home.tsx`: estado da experiência, consultas à PokéAPI, filtros, favoritos e modal de detalhes.
- `client/src/index.css`: sistema visual amarelo inspirado na imagem enviada, layout responsivo e animações.
- `client/src/App.tsx`: rotas `/` e `/pokapi` para a experiência principal.
- `public/manus-routes.json`: manifesto de rotas exigido pelo Webdev.

## Direção visual

- **Movimento:** produto editorial lúdico com energia de embalagem premium Pikachu.
- **Princípios:** amarelo luminoso, moldura fina branca, contraste preto suave e sensação de vitrine; grandes blocos de tipografia; dados organizados em cartões compactos; interações rápidas e físicas.
- **Paleta:** `#ffd21f` e `#ffca05` como assinatura; branco para superfícies e `#202020` para leitura; sombras quentes para profundidade.
- **Layout:** hero assimétrico com personagem à direita e título à esquerda; catálogo em faixa ampla com controles fixados no topo; modal de detalhes como ficha de colecionador.
- **Assinaturas:** aro arredondado branco, ruído/pontos amarelos sutis e etiquetas com pílulas de tipo.
- **Interação:** pesquisar, filtrar e favoritar sem navegação de página; cards têm foco visível e elevam no hover; modal pode ser fechado por botão ou Escape.
- **Animação:** entrada com zoom e subida do Pikachu, títulos em stagger, cards com fade/slide e pulso suave durante carregamento.
- **Tipografia:** Inter para interface e uma display pesada em `Arial Black` para “POKÉDEX”; hierarquia alta, números monospace nos identificadores.
- **Essência:** uma Pokédex viva, direta e carismática para explorar o universo Pokémon em segundos. Alegre, curiosa, colecionável.
- **Voz:** convites curtos e ativos, como “Escolha seu próximo achado” e “Abra a ficha e descubra tudo”.
- **Wordmark:** `POKÉDEX` em caixa alta com acento amarelo e ponto circular como terminal visual.
- **Cor proprietária:** amarelo elétrico Pikachu.
