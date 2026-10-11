import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { ROLES, SKILLS, STEPS, TEAM, gaps, roleById, type RoleId } from "@/lib/vektor";
import { useVektor } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

type Tab = "path" | "gaps" | "plan" | "team";

function Home() {
  const { state, patch, toggle } = useVektor();
  const [tab, setTab] = useState<Tab>("path");

  const gapList = useMemo(
    () => gaps(state.current, state.target),
    [state.current, state.target],
  );
  const openGaps = gapList.filter((g) => g.delta > 0);
  const relevant = STEPS.filter((s) => openGaps.some((g) => g.skill.id === s.skill && g.delta >= 15));
  const plan = relevant.length ? relevant : STEPS.slice(0, 4);
  const doneCount = plan.filter((s) => state.done.includes(s.id)).length;
  const myProgress = plan.length ? Math.round((doneCount / plan.length) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary">Мини-приложение</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Вектор</h1>
          <p className="mt-1 text-muted">Путь от текущей роли к следующей — с конкретными шагами.</p>
        </div>
        <Mark />
      </header>

      <nav className="mb-5 grid grid-cols-4 gap-1 rounded-2xl bg-surface p-1 shadow-sm ring-1 ring-border">
        {([
          ["path", "Роли"],
          ["gaps", "Навыки"],
          ["plan", "План"],
          ["team", "Команда"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-11 rounded-xl px-2 text-sm font-semibold transition ${
              tab === id ? "bg-primary text-primary-fg" : "text-muted hover:bg-tint"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "path" && (
        <section className="space-y-4">
          <Field label="Как к вам обращаться">
            <input
              value={state.name}
              onChange={(e) => patch({ name: e.target.value.slice(0, 40) })}
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>
          <RolePick
            label="Сейчас"
            value={state.current}
            onChange={(current) =>
              patch({ current, target: current === state.target ? nextRole(current) : state.target })
            }
          />
          <RolePick label="Цель" value={state.target} onChange={(target) => patch({ target })} />
          {state.current === state.target ? (
            <p className="rounded-2xl bg-tint px-4 py-3 text-sm text-fg">
              Выберите роль выше текущей — тогда появится список пробелов.
            </p>
          ) : (
            <article className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              <p className="text-sm text-muted">Маршрут {state.name || "сотрудника"}</p>
              <p className="mt-1 text-xl font-bold">
                {roleById(state.current).title}
                <span className="mx-2 text-primary">→</span>
                {roleById(state.target).title}
              </p>
              <p className="mt-2 text-muted">
                {openGaps.length} навык{ending(openGaps.length)} требуют роста. Прогресс плана — {myProgress}%.
              </p>
              <button
                type="button"
                onClick={() => setTab("gaps")}
                className="mt-4 h-12 rounded-xl bg-primary px-5 font-semibold text-primary-fg"
              >
                Смотреть пробелы
              </button>
            </article>
          )}
        </section>
      )}

      {tab === "gaps" && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Что не дотягивает до {roleById(state.target).title}</h2>
          {gapList.map((g) => (
            <div key={g.skill.id} className="rounded-2xl bg-surface p-4 ring-1 ring-border">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="font-semibold">{g.skill.name}</p>
                <p className="text-sm text-muted">
                  {g.have} → {g.need}
                  {g.delta > 0 ? <span className="ml-2 font-semibold text-primary">+{g.delta}</span> : null}
                </p>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-border">
                <div className="absolute inset-y-0 left-0 bg-tint" style={{ width: `${g.need}%` }} />
                <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${g.have}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "plan" && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold">Шаги на пути</h2>
            <p className="text-sm font-semibold text-primary">
              {doneCount}/{plan.length}
            </p>
          </div>
          {plan.map((step) => {
            const on = state.done.includes(step.id);
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => toggle(step.id)}
                className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left ring-1 transition ${
                  on ? "bg-tint ring-primary" : "bg-surface ring-border hover:bg-tint"
                }`}
              >
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold ${
                    on ? "bg-primary text-primary-fg" : "bg-bg text-muted ring-1 ring-border"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {step.kind} · {SKILLS.find((s) => s.id === step.skill)?.name}
                  </span>
                  <span className="mt-0.5 block font-semibold">{step.title}</span>
                  <span className="mt-1 block text-sm text-muted">{step.detail}</span>
                </span>
              </button>
            );
          })}
        </section>
      )}

      {tab === "team" && (
        <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="font-bold">Команда разработки</h2>
            <span className="rounded-full bg-tint px-3 py-1 text-sm font-semibold text-primary">
              Вы {myProgress}%
            </span>
          </div>
          <ul>
            <TeamRow name={`${state.name || "Вы"} (вы)`} from={roleById(state.current).title} to={roleById(state.target).title} progress={myProgress} highlight />
            {TEAM.map((m) => (
              <TeamRow
                key={m.name}
                name={m.name}
                from={roleById(m.current).title}
                to={roleById(m.target).title}
                progress={m.progress}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 64 64" className="size-14 shrink-0" aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <path d="M16 44 L32 18 L48 44" fill="none" className="stroke-primary-fg" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function RolePick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RoleId;
  onChange: (id: RoleId) => void;
}) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            className={`min-h-14 rounded-xl px-3 py-2 text-left ring-1 ${
              value === r.id ? "bg-primary text-primary-fg ring-primary" : "bg-surface ring-border hover:bg-tint"
            }`}
          >
            <span className="block text-xs opacity-80">{r.track}</span>
            <span className="block text-sm font-semibold leading-tight">{r.title}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

function TeamRow({
  name,
  from,
  to,
  progress,
  highlight,
}: {
  name: string;
  from: string;
  to: string;
  progress: number;
  highlight?: boolean;
}) {
  return (
    <li className={`grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-4 py-3 ${highlight ? "bg-tint" : ""}`}>
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        <p className="truncate text-sm text-muted">
          {from} → {to}
        </p>
      </div>
      <div className="w-28">
        <p className="mb-1 text-right text-xs font-semibold text-muted">{progress}%</p>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </li>
  );
}

function ending(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "а";
  return "ов";
}

function nextRole(id: RoleId): RoleId {
  const i = ROLES.findIndex((r) => r.id === id);
  return ROLES[Math.min(i + 1, ROLES.length - 1)].id;
}
