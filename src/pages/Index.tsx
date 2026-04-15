import { useAssessment } from '@/hooks/useAssessment';
import AreaSelection from '@/components/AreaSelection';
import ContextScreen from '@/components/ContextScreen';
import QuestionScreen from '@/components/QuestionScreen';
import ResultScreen from '@/components/ResultScreen';
import ConsolidatedScreen from '@/components/ConsolidatedScreen';

const Index = () => {
  const {
    areas, selectedArea, setSelectedArea, results, extras, screen, sessionId,
    currentQ, answers, startContext, continueFromContext, selectAnswer,
    nextQuestion, prevQuestion, addArea, renameArea,
    redoArea, goHome, showConsolidated, saveExtras,
  } = useAssessment();

  return (
    <div className="assessment-wrap">
      {screen === 'home' && (
        <AreaSelection
          areas={areas}
          selectedArea={selectedArea}
          results={results}
          onSelect={setSelectedArea}
          onAdd={addArea}
          onRename={renameArea}
          onStart={startContext}
          onShowConsolidated={showConsolidated}
        />
      )}
      {screen === 'context' && selectedArea && (
        <ContextScreen
          areaName={selectedArea}
          initialContext={extras[selectedArea]?.context || ''}
          onContinue={continueFromContext}
          onBack={goHome}
        />
      )}
      {screen === 'questions' && (
        <QuestionScreen
          currentQ={currentQ}
          answers={answers}
          onSelect={selectAnswer}
          onNext={nextQuestion}
          onPrev={prevQuestion}
        />
      )}
      {screen === 'result' && selectedArea && results[selectedArea] && (
        <ResultScreen
          areaName={selectedArea}
          result={results[selectedArea]}
          extras={extras[selectedArea] || { context: '', kpis: [], checklist: [], actionPlanContent: '' }}
          sessionId={sessionId}
          onHome={goHome}
          onRedo={redoArea}
          onConsolidated={showConsolidated}
          onSaveExtras={(extra) => saveExtras(selectedArea, extra)}
        />
      )}
      {screen === 'consolidated' && (
        <ConsolidatedScreen results={results} onHome={goHome} />
      )}
    </div>
  );
};

export default Index;
