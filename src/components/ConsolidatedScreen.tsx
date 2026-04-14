import { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { TOPICS, CHART_PALETTE, getLevel, type AreaResult } from '@/data/assessmentData';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ConsolidatedScreenProps {
  results: Record<string, AreaResult>;
  onHome: () => void;
}

export default function ConsolidatedScreen({ results, onHome }: ConsolidatedScreenProps) {
  const areas = Object.keys(results);

  const avg = useMemo(() =>
    TOPICS.map(t => ({
      id: t.id,
      v: areas.reduce((s, a) => s + results[a].ts[t.id], 0) / areas.length,
    })), [areas, results]);

  const radarData = useMemo(() => ({
    labels: TOPICS.map(t => t.short),
    datasets: areas.map((a, i) => ({
      label: a,
      data: TOPICS.map(t => results[a].ts[t.id]),
      backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] + '22',
      borderColor: CHART_PALETTE[i % CHART_PALETTE.length],
      pointBackgroundColor: CHART_PALETTE[i % CHART_PALETTE.length],
      borderWidth: 2,
      pointRadius: 3,
      borderDash: i > 0 ? [4, 3] : undefined,
    })),
  }), [areas, results]);

  const avgRadarData = useMemo(() => ({
    labels: TOPICS.map(t => t.short),
    datasets: [{
      label: 'Média geral',
      data: avg.map(a => a.v),
      backgroundColor: 'rgba(55,138,221,.15)',
      borderColor: '#378ADD',
      pointBackgroundColor: '#378ADD',
      borderWidth: 2,
      pointRadius: 4,
    }],
  }), [avg]);

  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const, labels: { font: { size: 11 }, boxWidth: 10, padding: 10 } },
    },
    scales: {
      r: {
        min: 0, max: 5,
        ticks: { stepSize: 1, font: { size: 9 }, backdropColor: 'transparent' },
        grid: { color: 'rgba(0,0,0,0.07)' },
        pointLabels: { font: { size: 11 } },
        angleLines: { color: 'rgba(0,0,0,0.07)' },
      },
    },
  }), []);

  const sortedTopics = [...TOPICS].sort(
    (a, b) => (avg.find(x => x.id === a.id)?.v ?? 0) - (avg.find(x => x.id === b.id)?.v ?? 0)
  );

  return (
    <div>
      <button className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted mb-4" onClick={onHome}>
        ← Início
      </button>

      <h1 className="text-lg font-medium mb-1">Visão consolidada</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {areas.length} área(s) avaliada(s): {areas.join(', ')}
      </p>

      {/* Area Tags */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {areas.map(a => {
          const lvi = getLevel(results[a].total);
          return (
            <span
              key={a}
              className="px-2.5 py-1 rounded-full text-xs"
              style={{ background: lvi.bg, color: lvi.col, border: `0.5px solid ${lvi.col}55` }}
            >
              {a} — {results[a].total.toFixed(1)} ({lvi.name})
            </span>
          );
        })}
      </div>

      {/* Comparative Radar */}
      <div className="relative w-full h-[320px] mb-5">
        <Radar data={radarData} options={radarOptions} />
      </div>

      <hr className="border-t border-border my-5" />

      {/* Average Bars */}
      <p className="text-sm font-medium mb-2.5">Média por domínio — empresa</p>
      <div className="mb-5">
        {sortedTopics.map(t => {
          const s = avg.find(x => x.id === t.id)?.v ?? 0;
          const lx = getLevel(s);
          return (
            <div key={t.id} className="bar-row">
              <span className="bar-label">{t.short}</span>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${(s / 5 * 100).toFixed(0)}%`, background: lx.col }} />
              </div>
              <span className="text-xs font-medium w-[26px] text-right" style={{ color: lx.col }}>{s.toFixed(1)}</span>
            </div>
          );
        })}
      </div>

      {/* Average Radar */}
      <div className="relative w-full h-[270px] mb-5">
        <Radar data={avgRadarData} options={{ ...radarOptions, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
}
