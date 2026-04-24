import { useState } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import HomeScreen from '@/components/HomeScreen';
import AreaSelection from '@/components/AreaSelection';
import ContextScreen from '@/components/ContextScreen';
import QuestionScreen from '@/components/QuestionScreen';
import ResultScreen from '@/components/ResultScreen';
import ConsolidatedScreen from '@/components/ConsolidatedScreen';
import KPIManagement from '@/components/KPIManagement';

const Index = () => {
  const [module, setModule] = useState<'home' | 'diagnosis' | 'kpi'>('home');
  const {
    areas, selectedArea, setSelectedArea, results, extras, screen, sessionId,
    currentQ, answers, startContext, continueFromContext, selectAnswer,
    nextQuestion, prevQuestion, addArea, renameArea, deleteArea,
    redoArea, goHome, showConsolidated, saveExtras,
  } = useAssessment();

  if (module === 'home') {
    return (
      <div className="assessment-wrap">
        <HomeScreen
          onDiagnosis={() => setModule('diagnosis')}
          onKPIManagement={() => setModule('kpi')}
        />
      </div>
    );
  }

  if (module === 'kpi') {
    return (
      <div className="assessment-wrap">
        <KPIManagement
          sessionId={sessionId}
          areas={areas}
          results={results}
          onBack={() => setModule('home')}
        />
      </div>
    );
  }

  const handleGoHome = () => {
    goHome();
  };

  const handleBackToMain = () => {
    setModule('home');
  };

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
          onBackToMain={handleBackToMain}
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
