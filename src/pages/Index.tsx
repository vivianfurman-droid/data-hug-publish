import { useAssessment } from '@/hooks/useAssessment';
import AreaSelection from '@/components/AreaSelection';
import QuestionScreen from '@/components/QuestionScreen';
import ResultScreen from '@/components/ResultScreen';
import ConsolidatedScreen from '@/components/ConsolidatedScreen';

const Index = () => {
  const {
    areas, selectedArea, setSelectedArea, results, screen,
    currentQ, answers, startAssessment, selectAnswer,
    nextQuestion, prevQuestion, addArea, renameArea,
    redoArea, goHome, showConsolidated,
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
          onStart={startAssessment}
          onShowConsolidated={showConsolidated}
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
          onHome={goHome}
          onRedo={redoArea}
          onConsolidated={showConsolidated}
        />
      )}
      {screen === 'consolidated' && (
        <ConsolidatedScreen results={results} onHome={goHome} />
      )}
    </div>
  );
};

export default Index;
