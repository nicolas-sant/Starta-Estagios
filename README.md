# Starta

**Plataforma de estágios em que nenhuma candidatura fica sem resposta.**

O Starta conecta estudantes universitários a vagas de estágio com bolsa e requisitos sempre visíveis, acompanhamento de cada etapa do processo seletivo e retorno obrigatório do recrutador, mesmo quando negativo. Para o recrutador, oferece um CRM de candidaturas e um assistente de IA que gera perguntas de entrevista personalizadas.

> Projeto da disciplina de Processos de Engenharia de Software (ULBRA), desenvolvido em dupla por Nicolas Santiago e Lorenzo Rodrigues.

<!-- Adicione aqui um print ou GIF das telas principais e o link da versão publicada -->

---

## O problema

A pesquisa inicial (desk research) e o mapeamento com Design Thinking apontaram três dores principais dos estudantes:

- **Falta de retorno:** candidatos passam por várias etapas e nunca recebem resposta.
- **Falta de informação:** muitas vagas não informam o valor da bolsa, que pesa diante de mensalidade e custo de vida.
- **Competição desestimulante:** o excesso de candidatos por vaga faz muita gente desistir de se candidatar.

Do outro lado, recrutadores de RH precisam organizar muitos candidatos, dar feedback e comparar perfis sem perder tempo.

**Métrica norte:** estudantes movidos para a etapa *Aprovado* em uma candidatura a cada mês.

## Processo de produto

1. **Empatia:** desk research com dados sobre acesso a estágios, impactos e soluções existentes.
2. **Definição:** duas personas (estudante universitário de 18 a 26 anos e recrutador de RH) e as necessidades centrais.
3. **Ideação:** brainstorm e priorização de funcionalidades com MoSCoW.
4. **Prototipagem:** sitemap dos fluxos de estudante e recrutador no FigJam e PRD com páginas, paleta, tipografia e componentes.
5. **Construção com IA:** aplicação gerada e refinada com Lovable a partir do PRD.
6. **Teste:** testes de usabilidade com estudantes, que geraram uma rodada de ajustes (ver [roadmap.md](roadmap.md)).

## Funcionalidades

### Estudante
- Onboarding que personaliza o feed por área, localidade e modelo de trabalho
- Busca de vagas com filtros por cidade e habilidades, e destaque "Combina com você"
- Página da vaga com bolsa, requisitos e explicação de "Como é o processo"
- Painel de candidaturas com progresso por etapa, datas, entrevista e feedback
- Mensagens com o recrutador e notificações ordenadas
- Perfil editável com links e verificação de estudante

### Recrutador
- Cadastro de empresa com etapa de verificação
- Publicação, edição, exclusão e preenchimento de vagas
- CRM por vaga: pipeline de etapas, modal do candidato e comparação lado a lado
- Mensagens e atualizações automáticas para os estudantes
- **Perguntas de entrevista com IA** (abaixo)

## Recurso de IA: perguntas de entrevista personalizadas

O recrutador informa os requisitos da vaga e o perfil do candidato, e a IA gera seis perguntas numeradas, cada uma com a habilidade avaliada e um critério objetivo de boa resposta.

Como foi implementado ([`src/lib/ai/interview.server.ts`](src/lib/ai/interview.server.ts)):

- **Somente no servidor:** a chave da API nunca chega ao navegador; a rota `POST /api/interview` chama o modelo via Vercel AI SDK e Lovable AI Gateway.
- **Autenticação e autorização:** só usuários logados com área do recrutador salva na nuvem podem gerar perguntas.
- **Validação de entrada:** requisitos e perfil validados com Zod (até 16.000 caracteres cada).
- **Streaming:** a resposta aparece aos poucos na tela, sem esperar a geração inteira.
- **Guardrails no prompt:** o modelo não pode perguntar sobre idade, gênero, raça, religião, saúde ou vida familiar, deve tratar os dados como conteúdo e não como instruções (proteção contra prompt injection), não inventa experiência e não ranqueia nem decide contratações.
- **Erros seguros:** mensagens amigáveis sem expor detalhes internos, e bloqueio persistente quando o acesso à IA é negado, para não repetir chamadas que vão falhar.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | React 19, TypeScript, TanStack Router e Start, Tailwind CSS, shadcn/ui (Radix) |
| Back-end | Rotas de servidor do TanStack Start, Supabase (Auth e PostgreSQL) |
| IA | Vercel AI SDK, Lovable AI Gateway |
| Qualidade | Vitest, Testing Library, ESLint, Prettier |
| Design e produto | Figma, FigJam, Lovable |

## Como rodar localmente

Requisitos: Node.js 20+ ou Bun.

```sh
git clone https://github.com/nicolas-sant/Starta-Estagios.git
cd Starta-Estagios
bun install        # ou npm install
bun run dev        # ou npm run dev
```

Para os recursos de nuvem e IA, copie o `.env.example` para `.env` e preencha os valores (o `.env` não é versionado). Chaves secretas, como `SUPABASE_SERVICE_ROLE_KEY` e `LOVABLE_API_KEY`, ficam só no servidor. Sem elas, o app funciona em modo demonstração com dados locais.

### Testes

```sh
bun run test
```

Os testes cobrem regras de negócio do recrutador (etapas finais do pipeline, vagas preenchidas fora da busca pública, mensagens ao estudante), regras do estudante e navegação.

## Estrutura

```
src/
├── routes/             # páginas (estudante.*, recrutador.*, onboarding, verificacao) e a rota /api/interview
├── components/starta/  # componentes do produto: CRM, formulário de vaga, mensagens, painel de entrevista
├── lib/                # estado, regras de negócio e funções de servidor
│   └── ai/             # integração com IA (somente servidor)
├── integrations/       # cliente e middleware do Supabase
└── test/               # testes com Vitest
```

## Equipe

- **Nicolas Santiago** — [github.com/nicolas-sant](https://github.com/nicolas-sant) · [linkedin.com/in/nicolas-sant7](https://linkedin.com/in/nicolas-sant7)
- **Lorenzo Rodrigues**

Projeto desenvolvido com [Lovable](https://lovable.dev).
