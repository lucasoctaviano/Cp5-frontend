# TechFlow Dashboard

Dashboard responsivo demonstrativo para acompanhamento de projetos, equipes e indicadores.

## Integrantes
- Lucas Octaviano Nogueira - Rm: 573368 - turma: 1ESPK

## Tecnologias utilizadas
- HTML5 semântico
- Tailwind CSS via CDN
- CSS complementar (`css/styles.css`)
- JavaScript puro (`js/app.js`)
- Google Fonts (Inter)

## Principais recursos implementados
- Layout Mobile-First para celular, tablet, notebook e desktop.
- Sidebar fixa no desktop e menu deslizante com overlay no mobile.
- Navbar com pesquisa, notificações e dropdown do usuário.
- Quatro indicadores: projetos ativos, projetos concluídos, tarefas pendentes e equipes.
- Seis projetos de exemplo em CSS Grid, com `col-span-*` e `row-span-*`.
- Busca por texto e filtro por status.
- Modal de cadastro de projetos com nome, responsável, categoria, prioridade, prazo e descrição.
- Validação visual com mensagens de erro, foco no primeiro campo inválido e confirmação de sucesso.
- Tema Light, Dark e System, com suporte à preferência do sistema e persistência em `localStorage`.
- Estados de hover, focus, active e disabled, transições e microinterações.
- Exportação da lista de projetos visíveis para CSV.
- Dados fictícios; não há backend nem banco de dados.

## Como executar
1. Baixe ou clone o repositório.
2. Abra `index.html` no navegador. Para uma experiência mais consistente, use a extensão **Live Server** no VS Code.
3. Mantenha conexão com a internet para carregar o Tailwind CDN e a fonte Inter.

## Link do GitHub
- Repositório: `https://github.com/SEU-USUARIO/techflow-dashboard`
- Substitua o endereço acima pelo link real do repositório após publicar o projeto.

## Dificuldades encontradas
- Conciliar o layout de cards de tamanhos diferentes com a responsividade do CSS Grid.
- Garantir que o tema System acompanhe as mudanças de preferência do sistema operacional.
- Implementar validação visual e acessível no formulário sem utilizar bibliotecas externas.
- Manter a sidebar utilizável em telas pequenas sem prejudicar a navegação.
- Como este projeto é um protótipo front-end, os dados cadastrados não são persistidos em banco de dados.

## Observação técnica
O Tailwind é carregado pelo CDN para facilitar a execução sem etapa de build. Em um projeto de produção, recomenda-se instalar o Tailwind via CLI/PostCSS para gerar CSS otimizado.
