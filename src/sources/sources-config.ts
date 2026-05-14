export type GitHubIssuesRepositoryConfig = {
  owner: string;
  repo: string;
  sourceName: string;
  category: string;
  priority: number;
  enabled: boolean;
};

export const githubIssuesRepositories: GitHubIssuesRepositoryConfig[] = [
  {
    owner: "frontendbr",
    repo: "vagas",
    sourceName: "GitHub frontendbr/vagas",
    category: "frontend",
    priority: 1,
    enabled: true,
  },
  {
    owner: "backend-br",
    repo: "vagas",
    sourceName: "GitHub backend-br/vagas",
    category: "backend",
    priority: 1,
    enabled: true,
  },
  {
    owner: "react-brasil",
    repo: "vagas",
    sourceName: "GitHub react-brasil/vagas",
    category: "frontend",
    priority: 2,
    enabled: true,
  },
  {
    owner: "nodejsdevbr",
    repo: "vagas",
    sourceName: "GitHub nodejsdevbr/vagas",
    category: "backend",
    priority: 2,
    enabled: true,
  },
  {
    owner: "qa-brasil",
    repo: "vagas",
    sourceName: "GitHub qa-brasil/vagas",
    category: "qa",
    priority: 2,
    enabled: true,
  },
  {
    owner: "soujava",
    repo: "vagas-java",
    sourceName: "GitHub soujava/vagas-java",
    category: "backend",
    priority: 3,
    enabled: true,
  },
  {
    owner: "datascience-br",
    repo: "vagas",
    sourceName: "GitHub datascience-br/vagas",
    category: "data",
    priority: 3,
    enabled: true,
  },
  {
    owner: "DevOps-Brasil",
    repo: "Vagas",
    sourceName: "GitHub DevOps-Brasil/Vagas",
    category: "devops",
    priority: 3,
    enabled: true,
  },
  {
    owner: "programadores-br",
    repo: "geral",
    sourceName: "GitHub programadores-br/geral",
    category: "general",
    priority: 4,
    enabled: true,
  },
  {
    owner: "dotnetdevbr",
    repo: "vagas",
    sourceName: "GitHub dotnetdevbr/vagas",
    category: "backend",
    priority: 4,
    enabled: true,
  },
  {
    owner: "brasil-php",
    repo: "vagas",
    sourceName: "GitHub brasil-php/vagas",
    category: "backend",
    priority: 4,
    enabled: true,
  },
  {
    owner: "androiddevbr",
    repo: "vagas",
    sourceName: "GitHub androiddevbr/vagas",
    category: "mobile",
    priority: 4,
    enabled: true,
  },
  {
    owner: "remotejobsbr",
    repo: "design-ux-vagas",
    sourceName: "GitHub remotejobsbr/design-ux-vagas",
    category: "design",
    priority: 5,
    enabled: true,
  },
  {
    owner: "CangaceirosDevels",
    repo: "vagas_de_emprego",
    sourceName: "GitHub CangaceirosDevels/vagas_de_emprego",
    category: "general",
    priority: 5,
    enabled: true,
  },
  {
    owner: "CocoaHeadsBrasil",
    repo: "vagas",
    sourceName: "GitHub CocoaHeadsBrasil/vagas",
    category: "mobile",
    priority: 5,
    enabled: true,
  },
  {
    owner: "backend-pt",
    repo: "vagas",
    sourceName: "GitHub backend-pt/vagas",
    category: "backend",
    priority: 5,
    enabled: true,
  },
];
