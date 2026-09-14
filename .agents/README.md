# .agents

Pasta isolada com a configuração e as instruções para agentes de IA deste
repositório. Tudo aqui é versionado no Git.

## Conteúdo

- `AGENTS.md` — instruções principais do projeto. Carregado pelo OpenCode via
  `opencode.json` → `instructions`.
- `skills/` — skills instaladas via `npx skills add` e carregadas via
  `opencode.json` → `skills.paths`. As versões ficam travadas em
  `skills-lock.json` na raiz do repo.
- `agents/` — documentação/referência de subagentes (não carregada
  automaticamente).
- `commands/` — documentação/referência de comandos (não carregada
  automaticamente).

## Skills instaladas

- `caveman` — modo de comunicação comprimido.
- `codebase-design` — vocabulário e disciplina de design de módulos.
- `domain-modeling` — glossário do domínio (`CONTEXT.md`) e ADRs.
- `grilling` — entrevista estruturada sobre decisões.
- `improve-codebase-architecture` — varredura de oportunidades de deepening.

Instalar mais: `npx skills add <repo> --skill <nome> --agent opencode -y`.
Atualizar: `npx skills update`. Restaurar do lock: `npx skills experimental_install`.

## Por que `agents/` e `commands/` não são funcionais

O OpenCode só auto-carrega subagentes e comandos dos caminhos canônicos
`.opencode/agent(s)/` e `.opencode/command(s)/`, ou inline no `opencode.json`.
Não existe opção de pasta customizada para eles. Estes arquivos ficam aqui
apenas como referência/organização.

## Wire-up

Tudo é registrado em `opencode.json` na raiz. Após alterar qualquer arquivo de
configuração, reinicie o OpenCode — a config não é recarregada em runtime.
