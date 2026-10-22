export type SkillLevel = "essencial" | "recomendado";
export type Skill = { name: string; level: SkillLevel; weight?: number };
export type Modality = "Presencial" | "Híbrido" | "Remoto";

export type Company = {
  id: string;
  name: string;
  sector: string;
  city: string;
  size: string;
  about: string;
  verified: boolean;
  responseRate: number; // % de candidatos que recebem retorno
  avgResponseDays: number;
  initials: string;
};

export type Job = {
  id: string;
  companyId: string;
  title: string;
  area: string;
  summary: string;
  description: string;
  responsibilities: string[];
  stipend: number;
  benefits: string[];
  modality: Modality;
  city: string;
  hours: string;
  skills: Skill[];
  postedDaysAgo: number;
  applicants: number;
  filledFields: number; // 0-100 completude -> selo de confiança
  /** etapas do processo seletivo; padrão = etapas da plataforma, sem teste técnico */
  process?: { steps: string[]; technicalTest: boolean };
};

export const DEFAULT_PROCESS = { steps: ["Inscrição", "Triagem de currículo", "Entrevista", "Resultado"], technicalTest: false };

export const AREAS = [
  "Administração",
  "Tecnologia",
  "Marketing",
  "Finanças",
  "Design",
  "Recursos Humanos",
  "Engenharia",
  "Direito",
];

export const CITIES = [
  "Recife, PE",
  "Olinda, PE",
  "Jaboatão dos Guararapes, PE",
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Salvador, BA",
  "Fortaleza, CE",
  "Porto Alegre, RS",
  "Curitiba, PR",
  "Brasília, DF",
  "Manaus, AM",
  "Belém, PA",
  "Natal, RN",
  "João Pessoa, PB",
];

export const COMPANIES: Company[] = [
  {
    id: "porto-digital",
    name: "Mangue Labs",
    sector: "Tecnologia",
    city: "Recife, PE",
    size: "201–500 funcionários",
    about:
      "Software house nascida no Porto Digital. Desenvolvemos produtos para varejo e saúde no Nordeste e formamos talentos desde o primeiro estágio.",
    verified: true,
    responseRate: 96,
    avgResponseDays: 3,
    initials: "ML",
  },
  {
    id: "banco-sertao",
    name: "Banco Sertão",
    sector: "Finanças",
    city: "Recife, PE",
    size: "1.000+ funcionários",
    about:
      "Banco regional com foco em crédito para pequenos negócios. Programa de estágio com trilha de desenvolvimento de 2 anos.",
    verified: true,
    responseRate: 88,
    avgResponseDays: 5,
    initials: "BS",
  },
  {
    id: "frevo-comunicacao",
    name: "Frevo Comunicação",
    sector: "Marketing",
    city: "Olinda, PE",
    size: "11–50 funcionários",
    about: "Agência independente de branding e conteúdo para marcas nordestinas.",
    verified: true,
    responseRate: 74,
    avgResponseDays: 7,
    initials: "FC",
  },
  {
    id: "logix",
    name: "Logix Distribuidora",
    sector: "Logística",
    city: "Jaboatão dos Guararapes, PE",
    size: "501–1.000 funcionários",
    about: "Distribuição e logística para o Norte e Nordeste.",
    verified: false,
    responseRate: 31,
    avgResponseDays: 21,
    initials: "LX",
  },
];

export const JOBS: Job[] = [
  {
    id: "adm-financeiro-bs",
    companyId: "banco-sertao",
    title: "Estágio em Administração Financeira",
    area: "Administração",
    summary: "Apoio à área de crédito PJ: análise de cadastros, relatórios semanais e atendimento a gerentes.",
    description:
      "Você vai integrar o time de Crédito PJ, apoiando a análise de cadastros de pequenas empresas e a produção de relatórios que orientam a concessão de crédito na região.",
    responsibilities: [
      "Conferir documentação cadastral de clientes PJ",
      "Atualizar planilhas e dashboards semanais",
      "Apoiar gerentes no acompanhamento de carteira",
    ],
    stipend: 1800,
    benefits: ["Vale-transporte", "Vale-refeição R$ 35/dia", "Plano de saúde"],
    modality: "Híbrido",
    city: "Recife, PE",
    hours: "6h/dia · 30h semanais",
    skills: [
      { name: "Excel intermediário", level: "essencial", weight: 3 },
      { name: "Matemática financeira", level: "essencial", weight: 3 },
      { name: "Comunicação", level: "recomendado", weight: 2 },
      { name: "Power BI", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 2,
    applicants: 64,
    filledFields: 100,
  },
  {
    id: "front-ml",
    companyId: "porto-digital",
    title: "Estágio em Desenvolvimento Front-end",
    area: "Tecnologia",
    summary: "Construa interfaces em React para produtos de saúde usados por milhares de pacientes.",
    description:
      "Atue no squad de Saúde, construindo telas acessíveis em React e TypeScript com mentoria semanal de um dev sênior.",
    responsibilities: [
      "Implementar componentes a partir do Figma",
      "Escrever testes de interface",
      "Participar de revisões de código",
    ],
    stipend: 2200,
    benefits: ["Auxílio home office", "Vale-refeição", "Gympass"],
    modality: "Remoto",
    city: "Recife, PE",
    hours: "6h/dia · 30h semanais",
    skills: [
      { name: "HTML e CSS", level: "essencial", weight: 3 },
      { name: "JavaScript", level: "essencial", weight: 3 },
      { name: "React", level: "recomendado", weight: 2 },
      { name: "Git", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 1,
    applicants: 112,
    filledFields: 100,
  },
  {
    id: "mkt-frevo",
    companyId: "frevo-comunicacao",
    title: "Estágio em Marketing de Conteúdo",
    area: "Marketing",
    summary: "Planeje e escreva conteúdo para redes sociais de marcas regionais.",
    description:
      "Você vai apoiar o planejamento editorial e a produção de conteúdo de clientes do varejo e da cultura pernambucana.",
    responsibilities: ["Redigir posts e roteiros", "Acompanhar métricas", "Apoiar captações"],
    stipend: 1400,
    benefits: ["Vale-transporte", "Day off no aniversário"],
    modality: "Presencial",
    city: "Olinda, PE",
    hours: "5h/dia · 25h semanais",
    skills: [
      { name: "Redação", level: "essencial", weight: 3 },
      { name: "Redes sociais", level: "essencial", weight: 2 },
      { name: "Canva", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 4,
    applicants: 38,
    filledFields: 90,
  },
  {
    id: "rh-ml",
    companyId: "porto-digital",
    title: "Estágio em Recursos Humanos",
    area: "Recursos Humanos",
    summary: "Apoie o time de People em recrutamento, onboarding e clima.",
    description: "Participe dos processos seletivos de ponta a ponta e da organização do programa de onboarding.",
    responsibilities: ["Triagem de currículos", "Agendar entrevistas", "Organizar onboarding"],
    stipend: 1700,
    benefits: ["Auxílio home office", "Vale-refeição"],
    modality: "Híbrido",
    city: "Recife, PE",
    hours: "6h/dia · 30h semanais",
    skills: [
      { name: "Comunicação", level: "essencial", weight: 3 },
      { name: "Organização", level: "essencial", weight: 2 },
      { name: "Pacote Office", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 6,
    applicants: 51,
    filledFields: 100,
  },
  {
    id: "adm-logix",
    companyId: "logix",
    title: "Estágio Administrativo",
    area: "Administração",
    summary: "Rotinas administrativas no centro de distribuição.",
    description: "Rotinas administrativas gerais.",
    responsibilities: ["Rotinas administrativas"],
    stipend: 0,
    benefits: [],
    modality: "Presencial",
    city: "Jaboatão dos Guararapes, PE",
    hours: "A combinar",
    skills: [{ name: "Pacote Office", level: "recomendado", weight: 1 }],
    postedDaysAgo: 12,
    applicants: 140,
    filledFields: 45,
  },
  {
    id: "design-frevo",
    companyId: "frevo-comunicacao",
    title: "Estágio em Design Gráfico",
    area: "Design",
    summary: "Crie peças visuais e identidades para clientes da agência.",
    description: "Trabalhe lado a lado com a direção de arte em projetos de identidade visual e campanhas.",
    responsibilities: ["Criar peças para redes", "Apoiar identidades visuais", "Preparar arquivos finais"],
    stipend: 1500,
    benefits: ["Vale-transporte", "Horário flexível"],
    modality: "Híbrido",
    city: "Olinda, PE",
    hours: "6h/dia · 30h semanais",
    skills: [
      { name: "Figma", level: "essencial", weight: 3 },
      { name: "Tipografia", level: "recomendado", weight: 2 },
      { name: "Illustrator", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 3,
    applicants: 29,
    filledFields: 95,
  },
  {
    id: "fin-bs",
    companyId: "banco-sertao",
    title: "Estágio em Controladoria",
    area: "Finanças",
    summary: "Conciliações contábeis e apoio ao fechamento mensal.",
    description: "Apoie o time de controladoria nas conciliações e no fechamento contábil mensal.",
    responsibilities: ["Conciliações bancárias", "Apoio ao fechamento", "Relatórios gerenciais"],
    stipend: 1900,
    benefits: ["Vale-transporte", "Vale-refeição", "Plano de saúde"],
    modality: "Presencial",
    city: "Recife, PE",
    hours: "6h/dia · 30h semanais",
    skills: [
      { name: "Contabilidade básica", level: "essencial", weight: 3 },
      { name: "Excel intermediário", level: "essencial", weight: 2 },
      { name: "SAP", level: "recomendado", weight: 1 },
    ],
    postedDaysAgo: 5,
    applicants: 47,
    filledFields: 100,
  },
];

export const STAGES = ["Recebido", "Triagem", "Entrevista", "Aprovado", "Recusado"] as const;
export type Stage = (typeof STAGES)[number];
export const STUDENT_STEPS = ["Inscrição", "Triagem", "Entrevista", "Resultado"] as const;

export const PREDEFINED_FEEDBACK = [
  "Seu perfil é muito promissor! Vamos avançar para a próxima etapa.",
  "Gostamos do seu currículo, mas buscamos alguém com mais domínio dos requisitos essenciais.",
  "A vaga foi preenchida. Manteremos seu perfil em nosso banco para próximas oportunidades.",
  "Recomendamos desenvolver as habilidades listadas em \"A desenvolver\" e se candidatar novamente.",
];

export function getCompany(id: string) {
  return COMPANIES.find((c) => c.id === id);
}

/** Selo de confiança: empresa verificada + vaga completa (bolsa, requisitos, descrição) */
export function hasTrustSeal(job: Job) {
  const c = getCompany(job.companyId);
  return !!c?.verified && job.filledFields >= 90 && job.stipend > 0;
}

/** Ranqueamento: selo melhora; empresas sem retorno sofrem penalidade de alcance */
export function rankScore(job: Job) {
  const c = getCompany(job.companyId);
  let score = 100 - job.postedDaysAgo * 2;
  if (hasTrustSeal(job)) score += 40;
  score += job.filledFields * 0.2;
  if (c && c.responseRate < 50) score -= 60;
  return score;
}

export function hasReachPenalty(companyId: string) {
  const c = getCompany(companyId);
  return !!c && c.responseRate < 50;
}

export const brl = (n: number) =>
  n > 0 ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "Não informada";
