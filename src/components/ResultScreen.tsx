import { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { TOPICS, LEVELS, PRESCRIPTIONS, getLevel, type AreaResult } from '@/data/assessmentData';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ResultScreenProps {
  areaName: string;
  result: AreaResult;
  onHome: () => void;
  onRedo: () => void;
  onConsolidated: () => void;
}

export default function ResultScreen({ areaName, result, onHome, onRedo, onConsolidated }: ResultScreenProps) {
  const level = getLevel(result.total);

  const chartData = useMemo(() => ({
    labels: TOPICS.map(t => t.short),
    datasets: [{
      label: areaName,
      data: TOPICS.map(t => result.ts[t.id]),
      backgroundColor: level.col + '28',
      borderColor: level.col,
      pointBackgroundColor: level.col,
      borderWidth: 2,
      pointRadius: 4,
    }],
  }), [areaName, result, level]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 5,
        ticks: { stepSize: 1, font: { size: 10 }, backdropColor: 'transparent' },
        grid: { color: 'rgba(0,0,0,0.07)' },
        pointLabels: { font: { size: 11 } },
        angleLines: { color: 'rgba(0,0,0,0.07)' },
      },
    },
  }), []);

  const sortedTopics = [...TOPICS].sort((a, b) => result.ts[a.id] - result.ts[b.id]);
  const weak3 = sortedTopics.slice(0, 3);

  return (
    <div>
      <button className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted mb-4" onClick={onHome}>
        ← Início
      </button>

      <h1 className="text-lg font-medium mb-1">{areaName}</h1>
      <p className="text-sm text-muted-foreground mb-5">Diagnóstico de maturidade de dados</p>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-card rounded-lg px-3.5 py-3">
          <div className="text-xs text-muted-foreground mb-1">Pontuação geral</div>
          <div className="text-2xl font-medium">{result.total.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">de 5.0</div>
        </div>
        <div className="bg-card rounded-lg px-3.5 py-3">
          <div className="text-xs text-muted-foreground mb-1">Nível atual</div>
          <div className="text-sm font-medium leading-snug" style={{ color: level.col }}>
            {level.label} — {level.name}
          </div>
        </div>
        <div className="bg-card rounded-lg px-3.5 py-3">
          <div className="text-xs text-muted-foreground mb-1">Próximo nível</div>
          <div className="text-sm font-medium leading-snug text-muted-foreground">{level.next}</div>
        </div>
      </div>

      {/* Level Steps */}
      <div className="grid grid-cols-5 gap-1 mb-5">
        {LEVELS.map(l => {
          const active = l.n === level.n;
          const done = l.n < level.n;
          return (
            <div
              key={l.n}
              className="py-[7px] px-1 rounded-[7px] text-center text-xs font-medium"
              style={{
                background: done || active ? l.bg : '#f5f5f5',
                color: done || active ? l.col : '#999',
                border: active ? `2px solid ${l.col}` : '2px solid transparent',
              }}
            >
              <div>{l.label}</div>
              <div className="text-[10px] font-normal mt-0.5 opacity-80">{l.name}</div>
            </div>
          );
        })}
      </div>

      {/* Banner */}
      <div
        className="rounded-xl px-5 py-4 mb-5 border-l-4"
        style={{ background: level.bg, borderLeftColor: level.col }}
      >
        <h2 className="text-[15px] font-medium mb-1.5" style={{ color: level.col }}>
          {level.label} — {level.name}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{level.desc}</p>
        <p className="text-sm leading-relaxed text-muted-foreground mt-2.5">
          <strong className="font-medium text-foreground">O que focar agora:</strong> {level.focus}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="relative w-full h-[280px] mb-5">
        <Radar data={chartData} options={chartOptions} />
      </div>

      <hr className="border-t border-border my-5" />

      {/* Domain Bars */}
      <p className="text-sm font-medium mb-2.5">Pontuação por domínio</p>
      <div className="mb-5">
        {sortedTopics.map(t => {
          const s = result.ts[t.id] || 0;
          const lx = getLevel(s);
          return (
            <div key={t.id} className="bar-row" title={t.ref}>
              <span className="bar-label">{t.short}</span>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${(s / 5 * 100).toFixed(0)}%`, background: lx.col }} />
              </div>
              <span className="text-xs font-medium w-[26px] text-right" style={{ color: lx.col }}>{s.toFixed(1)}</span>
            </div>
          );
        })}
      </div>

      <hr className="border-t border-border my-5" />

      {/* Prescriptions */}
      <p className="text-sm font-medium mb-2.5">Plano de ação — 3 domínios prioritários</p>
      <p className="text-xs text-muted-foreground mb-3">
        Ordenados do menor para o maior score. Cada domínio traz 3 ações: curto, médio e longo prazo.
      </p>

      <div className="flex flex-col gap-2 mb-5">
        {weak3.map((t, wi) => {
          const s = result.ts[t.id];
          const lx = getLevel(s);
          return (
            <div key={t.id}>
              <div className={`${wi > 0 ? 'mt-4' : ''} mb-1.5`}>
                <span className="text-sm font-medium">{t.lb}</span>{' '}
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: lx.bg, color: lx.col }}
                >
                  {lx.label} · {s.toFixed(1)}
                </span>
                <div className="text-[11px] text-muted-foreground/60 mt-0.5">{t.ref}</div>
              </div>
              {PRESCRIPTIONS[t.id].map((p, pi) => (
                <div
                  key={pi}
                  className="pcard mb-2"
                  style={{
                    borderLeftColor: p[0] === 'Curto prazo' ? '#E24B4A' : p[0] === 'Médio prazo' ? '#EF9F27' : '#534AB7',
                  }}
                >
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mb-1"
                    style={{ color: p[1], background: p[2] }}
                  >
                    {p[0]}
                  </span>
                  <div className="text-sm font-medium mb-0.5">{p[3]}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{p[4]}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap mt-2">
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90" onClick={onHome}>
          Avaliar outra área
        </button>
        <button className="px-4 py-2 text-sm border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/5" onClick={onRedo}>
          Refazer esta avaliação
        </button>
        <button className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted" onClick={onConsolidated}>
          Ver consolidado →
        </button>
      </div>
    </div>
  );
}
