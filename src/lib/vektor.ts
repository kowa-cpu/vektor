export type SkillId =
  | "sql"
  | "design"
  | "docker"
  | "review"
  | "comms"
  | "analytics"
  | "lead";

export type RoleId =
  | "intern"
  | "jbe"
  | "mbe"
  | "sbe"
  | "pa"
  | "pm";

export type Skill = { id: SkillId; name: string };
export type Role = {
  id: RoleId;
  title: string;
  track: "Инженерия" | "Продукт";
  levels: Record<SkillId, number>;
};

export const SKILLS: Skill[] = [
  { id: "sql", name: "SQL и данные" },
  { id: "design", name: "System Design" },
  { id: "docker", name: "Docker и инфраструктура" },
  { id: "review", name: "Code Review" },
  { id: "comms", name: "Коммуникация" },
  { id: "analytics", name: "Продуктовая аналитика" },
  { id: "lead", name: "Лидерство" },
];

const L = (
  sql: number,
  design: number,
  docker: number,
  review: number,
  comms: number,
  analytics: number,
  lead: number,
): Record<SkillId, number> => ({
  sql,
  design,
  docker,
  review,
  comms,
  analytics,
  lead,
});

export const ROLES: Role[] = [
  { id: "intern", title: "Стажёр", track: "Инженерия", levels: L(20, 5, 10, 10, 25, 10, 0) },
  { id: "jbe", title: "Junior Backend", track: "Инженерия", levels: L(40, 20, 25, 30, 35, 15, 5) },
  { id: "mbe", title: "Middle Backend", track: "Инженерия", levels: L(70, 55, 65, 70, 55, 30, 25) },
  { id: "sbe", title: "Senior Backend", track: "Инженерия", levels: L(85, 85, 80, 90, 75, 45, 60) },
  { id: "pa", title: "Product Analyst", track: "Продукт", levels: L(75, 15, 10, 15, 60, 80, 20) },
  { id: "pm", title: "Product Manager", track: "Продукт", levels: L(55, 30, 10, 20, 85, 70, 75) },
];

export type Step = {
  id: string;
  skill: SkillId;
  kind: "Курс" | "Задача" | "Наставник";
  title: string;
  detail: string;
};

export const STEPS: Step[] = [
  { id: "sql-c", skill: "sql", kind: "Курс", title: "SQL для рабочих задач", detail: "Оконные функции, индексы, планы запросов." },
  { id: "sql-t", skill: "sql", kind: "Задача", title: "Разобрать медленный отчёт", detail: "Найти узкое место и предложить индекс." },
  { id: "des-c", skill: "design", kind: "Курс", title: "System Design Basics", detail: "Нагрузка, кэш, границы сервисов." },
  { id: "des-t", skill: "design", kind: "Задача", title: "Схема сервиса уведомлений", detail: "Одна страница: контракт, очереди, отказ." },
  { id: "doc-c", skill: "docker", kind: "Курс", title: "Контейнеры без магии", detail: "Dockerfile, compose, окружения." },
  { id: "doc-t", skill: "docker", kind: "Задача", title: "Поднять сервис локально", detail: "Один контейнер + healthcheck." },
  { id: "rev-t", skill: "review", kind: "Задача", title: "Три содержательных ревью", detail: "Не стиль — риск, тест, контракт." },
  { id: "rev-m", skill: "review", kind: "Наставник", title: "Алексей К., Senior BE", detail: "Разбор ревью раз в две недели." },
  { id: "com-t", skill: "comms", kind: "Задача", title: "Статус без воды", detail: "Пять предложений: сделано, риск, следующий шаг." },
  { id: "com-m", skill: "comms", kind: "Наставник", title: "Марина Л., People Partner", detail: "Обратная связь по коммуникации." },
  { id: "an-c", skill: "analytics", kind: "Курс", title: "Метрики продукта", detail: "Воронка, когорты, что не считать успехом." },
  { id: "an-t", skill: "analytics", kind: "Задача", title: "Один эксперимент", detail: "Гипотеза, метрика, решение." },
  { id: "ld-t", skill: "lead", kind: "Задача", title: "Вести маленькую инициативу", detail: "Срок, состав, итог для команды." },
  { id: "ld-m", skill: "lead", kind: "Наставник", title: "Игорь П., Engineering Manager", detail: "Раз в месяц про рост и приоритеты." },
];

export function roleById(id: RoleId) {
  return ROLES.find((r) => r.id === id)!;
}

export function gaps(current: RoleId, target: RoleId) {
  const a = roleById(current).levels;
  const b = roleById(target).levels;
  return SKILLS.map((s) => ({
    skill: s,
    have: a[s.id],
    need: b[s.id],
    delta: Math.max(0, b[s.id] - a[s.id]),
  })).sort((x, y) => y.delta - x.delta);
}

export type TeamMember = {
  name: string;
  current: RoleId;
  target: RoleId;
  progress: number;
};

export const TEAM: TeamMember[] = [
  { name: "Иван С.", current: "jbe", target: "mbe", progress: 45 },
  { name: "Мария К.", current: "jbe", target: "mbe", progress: 72 },
  { name: "Дмитрий П.", current: "mbe", target: "sbe", progress: 34 },
  { name: "Анна В.", current: "pa", target: "pm", progress: 58 },
  { name: "Олег Н.", current: "intern", target: "jbe", progress: 81 },
];
