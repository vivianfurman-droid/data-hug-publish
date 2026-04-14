import { QUESTIONS, TOPICS } from '@/data/assessmentData';

interface QuestionScreenProps {
  currentQ: number;
  answers: Record<number, number>;
  onSelect: (qIndex: number, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const dotColors = [
  'bg-[hsl(var(--level-1))] text-[hsl(var(--level-1))]',
  'bg-[hsl(var(--level-2))] text-[hsl(var(--level-2))]',
  'bg-[hsl(var(--level-3))] text-[hsl(var(--level-3))]',
  'bg-[hsl(var(--level-4))] text-[hsl(var(--level-4))]',
  'bg-[hsl(var(--level-5))] text-[hsl(var(--level-5))]',
];

const dotBgColors = [
  { background: '#FCEBEB', color: '#A32D2D' },
  { background: '#FAEEDA', color: '#854F0B' },
  { background: '#EAF3DE', color: '#3B6D11' },
  { background: '#E6F1FB', color: '#185FA5' },
  { background: '#EEEDFE', color: '#3C3489' },
];

export default function QuestionScreen({ currentQ, answers, onSelect, onNext, onPrev }: QuestionScreenProps) {
  const q = QUESTIONS[currentQ];
  const topic = TOPICS.find(t => t.id === q.t)!;
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const isLast = currentQ === QUESTIONS.length - 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {topic.short}
        </span>
        <span className="text-xs text-muted-foreground">{currentQ + 1}/{QUESTIONS.length}</span>
      </div>

      <div className="h-[3px] bg-muted rounded mb-5">
        <div className="h-[3px] bg-primary rounded transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-[15px] font-medium mb-4 leading-relaxed">{q.q}</p>

      <div className="flex flex-col gap-[7px] mb-5">
        {q.o.map((opt, i) => (
          <div
            key={i}
            className={`opt-card ${answers[currentQ] === i + 1 ? 'selected' : ''}`}
            onClick={() => onSelect(currentQ, i + 1)}
          >
            <span
              className="level-dot"
              style={dotBgColors[i]}
            >
              {i + 1}
            </span>
            <span className="text-sm leading-snug">{opt.tx}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 text-sm border rounded-lg bg-background font-medium hover:bg-muted transition-colors"
          onClick={onPrev}
        >
          ← Voltar
        </button>
        <button
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          onClick={onNext}
        >
          {isLast ? 'Ver diagnóstico ✓' : 'Próxima →'}
        </button>
      </div>
    </div>
  );
}
