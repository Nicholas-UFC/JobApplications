# Nova feature: Monitoramento de empresas

Quero adicionar uma nova página ao front-end para cadastrar e acompanhar empresas nas quais tenho interesse em trabalhar. A página deve seguir o mesmo padrão visual e estrutural da página de plataformas já existente.

## 1. Página de empresas

A página deve apresentar uma lista de empresas que desejo monitorar para acompanhar a publicação de novas vagas em seus respectivos sites.

A tabela deve conter as seguintes colunas:

- **ID:** identificador da empresa.
- **Nome:** nome da empresa.
- **URL:** link para a página de vagas da empresa.
- **Última consulta:** data e hora da última vez que verifiquei a página de vagas em busca de novas oportunidades.

Cada empresa deve ter um botão de ação com um ícone que represente a confirmação de consulta, como um check ou um símbolo de atualização.

Ao clicar nesse botão, o sistema deve atualizar o campo `ultima_consulta` com a data e a hora atuais, utilizando `now()`. Dessa forma, será possível registrar quando cada empresa foi verificada pela última vez.

O objetivo dessa funcionalidade é manter uma lista organizada de empresas de interesse e facilitar o acompanhamento de suas páginas de vagas, permitindo identificar quais precisam ser consultadas novamente.

## 2. Seção de monitoramento na Home

Quero adicionar uma nova seção à página inicial (*Home*), posicionada ao lado das seções que já existem, respeitando o layout e o estilo visual atual do sistema.

Essa seção deve conter:

- **Título:** "Empresas para ficar de olho".
- **Subtítulo:** uma breve descrição explicando que a seção serve para acompanhar empresas de interesse e verificar a publicação de novas oportunidades de emprego.
- **Botão de atalho:** um botão que direcione o usuário para a página completa de empresas cadastradas.
- **Lista de empresas:** uma visualização resumida das empresas que estão sendo monitoradas.

A lista deve ser ordenada pela data da última consulta, exibindo primeiro as empresas que estão há mais tempo sem serem verificadas. Empresas que ainda não foram consultadas devem aparecer antes das demais.

A intenção é facilitar a identificação das empresas que precisam de atenção, sem que seja necessário acessar a página completa para descobrir quais estão há mais tempo sem verificação.

## 3. Objetivo e diretrizes de implementação

A funcionalidade deve centralizar o acompanhamento das empresas nas quais tenho interesse em trabalhar, facilitando a criação de uma rotina de consulta às páginas de vagas e a identificação de novas oportunidades.

A implementação deve respeitar os padrões visuais e arquiteturais já utilizados no projeto. Reutilize componentes existentes sempre que possível e mantenha a consistência com a página de plataformas e com o layout atual da Home.

Antes de implementar, analise a estrutura existente do projeto para identificar os componentes, as rotas, os modelos e os endpoints que podem ser reutilizados ou que precisam ser criados para dar suporte à nova funcionalidade.