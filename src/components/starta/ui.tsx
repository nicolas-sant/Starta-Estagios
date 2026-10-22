import { Link } from "@tanstack/react-router";
import { Check, FileText, ShieldCheck, Upload, Loader2, XCircle, CheckCircle2, AlertTriangle, MapPin, Wallet, Laptop } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { brl, getCompany, hasTrustSeal, hasReachPenalty, type Job, type Skill, type Stage } from "@/lib/data";
import type { VerificationStatus } from "@/lib/store";
import { daysUntil, fmtDate } from "@/lib/store";

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className={cn("font-display text-xl font-extrabold tracking-tight", light ? "text-primary-foreground" : "text-deep-space")}>
      start<span className="text-moss">a</span>
    </span>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-primary px-5 font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    />
  );
}

export function GhostButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-5 font-semibold text-deep-space transition hover:bg-mint disabled:opacity-40",
        className,
      )}
    />
  );
}

export function Field({ label, className, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-deep-space">{label}</span>
      <input
        {...p}
        className={cn(
          "h-12 w-full rounded-[10px] border border-border bg-card px-4 text-[15px] text-deep-space outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
      />
    </label>
  );
}

export function VerifiedSeal({ label = "Verificada", small }: { label?: string; small?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-lemon font-semibold text-deep-space ring-1 ring-deep-space/10",
        small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      )}
    >
      <ShieldCheck className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
      {label}
    </span>
  );
}

export function SkillTag({ skill }: { skill: Skill }) {
  const ess = skill.level === "essencial";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-xs font-medium text-deep-space">
      {skill.name}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          ess ? "bg-essential text-essential-foreground" : "bg-recommended text-recommended-foreground",
        )}
      >
        {ess ? "Essencial" : "Recomendado"}
      </span>
    </span>
  );
}

export function NeutralTag({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-tag px-2.5 py-1 text-xs font-medium text-deep-space">
      {icon}
      {children}
    </span>
  );
}

export function Stepper({ steps, current, failed }: { steps: readonly string[]; current: number; failed?: boolean }) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((s, i) => {
        const done = i < current || (i === current && i === steps.length - 1 && !failed && current === steps.length - 1 && false);
        const isCurrent = i === current;
        return (
          <li key={s} className="flex flex-1 flex-col items-center text-center last:flex-none last:basis-16">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                  done && "border-moss bg-moss text-deep-space",
                  isCurrent && !failed && "border-primary bg-primary text-primary-foreground",
                  isCurrent && failed && "border-destructive bg-destructive text-destructive-foreground",
                  !done && !isCurrent && "border-neutral-tag bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className={cn("mx-1 h-0.5 flex-1 rounded", i < current ? "bg-moss" : "bg-neutral-tag")} />}
            </div>
            <span className={cn("mt-1.5 w-16 text-[11px] font-semibold", isCurrent ? "text-deep-space" : "text-muted-foreground")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OnboardingProgress({ label, step, total }: { label: string; step: number; total: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-deep-space">{label}</span>
        <span className="label-mono text-muted-foreground">
          {step}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-tag">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function CompanyAvatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl bg-deep-space font-display font-extrabold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </span>
  );
}

export function JobCard({ job, applied, match }: { job: Job; applied?: boolean; match?: string[] }) {
  const c = getCompany(job.companyId);
  const seal = hasTrustSeal(job);
  const matched = !!match?.length;
  return (
    <article className={cn("relative rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] transition hover:border-primary/40", matched ? "border-2 border-moss" : "border-border")}>
      {matched && (
        <p className="-mx-4 -mt-4 mb-3 flex flex-wrap items-center gap-x-2 rounded-t-[14px] bg-recommended px-4 py-2 text-xs font-bold text-recommended-foreground">
          <CheckCircle2 className="h-4 w-4" /> Combina com você
          <span className="font-medium">· {match!.join(" · ")}</span>
        </p>
      )}
      <div className="flex items-start gap-3">
        <CompanyAvatar initials={c?.initials ?? "?"} />
        <div className="min-w-0 flex-1 pr-20">
          <Link to="/estudante/vaga/$id" params={{ id: job.id }} className="block font-display text-[17px] font-bold leading-snug text-deep-space after:absolute after:inset-0">
            {job.title}
          </Link>
          {c && (
            <Link to="/estudante/empresa/$id" params={{ id: c.id }} className="relative z-10 text-sm font-medium text-primary hover:underline">
              {c.name}
            </Link>
          )}
        </div>
        <div className={cn("absolute right-4", matched ? "top-14" : "top-4")}>{seal ? <VerifiedSeal small label="Confiável" /> : <NeutralTag>Sem selo</NeutralTag>}</div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <NeutralTag icon={<Wallet className="h-3.5 w-3.5" />}>{brl(job.stipend)}</NeutralTag>
        <NeutralTag icon={<Laptop className="h-3.5 w-3.5" />}>{job.modality}</NeutralTag>
        <NeutralTag icon={<MapPin className="h-3.5 w-3.5" />}>{job.city}</NeutralTag>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {job.skills.slice(0, 3).map((s) => (
          <SkillTag key={s.name} skill={s} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="label-mono text-muted-foreground">
          {job.applicants} candidatos · há {job.postedDaysAgo}d
        </span>
        {applied ? (
          <span className="label-mono text-recommended-foreground">✓ Candidatado</span>
        ) : hasReachPenalty(job.companyId) ? (
          <span className="label-mono text-destructive">Baixo retorno · {c?.responseRate}%</span>
        ) : (
          <span className="label-mono text-recommended-foreground">Retorno {c?.responseRate}%</span>
        )}
      </div>
    </article>
  );
}

export function DocChip({ title, onRemove }: { title: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-tag px-3 text-sm font-medium text-deep-space">
      <FileText className="h-4 w-4" />
      {title}
      {onRemove && (
        <button onClick={onRemove} aria-label="Remover" className="-mr-1 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-card">
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </span>
  );
}

const stageStyles: Record<Stage, string> = {
  Recebido: "bg-neutral-tag text-deep-space",
  Triagem: "bg-essential text-essential-foreground",
  Entrevista: "bg-lemon text-deep-space",
  Aprovado: "bg-recommended text-recommended-foreground",
  Recusado: "bg-destructive/10 text-destructive",
};

export function StageTag({ stage }: { stage: Stage }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageStyles[stage])}>{stage}</span>;
}

export function ValiditySeal({ validUntil, status }: { validUntil: string; status: VerificationStatus }) {
  if (status !== "aprovado" || !validUntil) return <NeutralTag icon={<AlertTriangle className="h-3.5 w-3.5" />}>Verificação pendente</NeutralTag>;
  const d = daysUntil(validUntil);
  if (d < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" /> Verificação pendente
      </span>
    );
  if (d <= 15)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-tag px-2.5 py-1 text-xs font-semibold text-deep-space ring-1 ring-destructive/40">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Vence em {d}d · reenviar
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-recommended px-2.5 py-1 text-xs font-semibold text-recommended-foreground">
      <CheckCircle2 className="h-3.5 w-3.5" /> Válido até {fmtDate(validUntil)}
    </span>
  );
}

export function UploadArea({
  status,
  fileName,
  refuseReason,
  onFile,
  title = "Arraste ou selecione o PDF",
}: {
  status: VerificationStatus;
  fileName: string;
  refuseReason?: string;
  onFile: (f: File) => void;
  title?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const states: Record<VerificationStatus, { label: string; icon: ReactNode; cls: string }> = {
    vazio: { label: "Nenhum arquivo enviado", icon: <Upload className="h-6 w-6" />, cls: "text-muted-foreground" },
    enviado: { label: "Enviado", icon: <FileText className="h-6 w-6" />, cls: "text-primary" },
    analise: { label: "Em análise", icon: <Loader2 className="h-6 w-6 animate-spin" />, cls: "text-primary" },
    aprovado: { label: "Aprovado", icon: <CheckCircle2 className="h-6 w-6" />, cls: "text-recommended-foreground" },
    recusado: { label: "Recusado", icon: <XCircle className="h-6 w-6" />, cls: "text-destructive" },
  };
  const st = states[status];
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card px-6 py-10 text-center transition hover:border-primary",
          status === "aprovado" ? "border-moss bg-recommended" : status === "recusado" ? "border-destructive/50" : "border-border",
        )}
      >
        <span className={st.cls}>{st.icon}</span>
        <span className="font-display font-bold text-deep-space">{status === "vazio" || status === "recusado" ? title : fileName}</span>
        <span className="text-sm text-muted-foreground">{status === "vazio" ? "Apenas PDF · até 5 MB" : status === "recusado" ? "Toque para enviar outro arquivo" : fileName ? "PDF" : ""}</span>
      </button>
      <input ref={ref} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <VerificationProgress status={status} />
      {status === "recusado" && refuseReason && (
        <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Motivo:</strong> {refuseReason}
        </p>
      )}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-deep-space">{children}</h2>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]", className)}>{children}</div>;
}

/** Indicador de progresso (não clicável) da verificação de matrícula */
export function VerificationProgress({ status }: { status: VerificationStatus }) {
  const last = status === "recusado" ? "Recusado" : "Aprovado";
  const steps = ["Enviado", "Em análise", last];
  const idx = status === "vazio" ? -1 : status === "enviado" ? 0 : status === "analise" ? 1 : 2;
  return (
    <div className="mt-4" role="group" aria-label="Andamento da verificação">
      <p className="label-mono mb-2 text-muted-foreground">Andamento</p>
      <ol className="flex items-start">
        {steps.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          const bad = current && status === "recusado";
          return (
            <li key={s} aria-current={current ? "step" : undefined} className="flex flex-1 flex-col items-start last:w-24 last:flex-none last:items-end">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded-full",
                    done && "bg-moss",
                    current && !bad && (status === "aprovado" ? "bg-moss ring-4 ring-moss/30" : "bg-primary ring-4 ring-primary/25"),
                    bad && "bg-destructive ring-4 ring-destructive/25",
                    !done && !current && "bg-neutral-tag",
                  )}
                />
                {i < steps.length - 1 && <span className={cn("h-0.5 flex-1", i < idx ? "bg-moss" : "bg-neutral-tag")} />}
              </div>
              <span className={cn("mt-1.5 whitespace-nowrap text-xs", current ? (bad ? "font-bold text-destructive" : "font-bold text-deep-space") : done ? "text-deep-space" : "text-muted-foreground")}>
                {s}
                {current && <span className="sr-only"> (etapa atual)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
