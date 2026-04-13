import { useState } from 'react';
import { PitchForm } from './components/PitchForm';
import { PitchResult } from './components/PitchResult';
import { LoadingSteps } from './components/LoadingSteps';
import { generatePitchApi } from './api/generate';
import type { PitchRequest, PitchResponse } from './api/generate';
import { AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [result, setResult] = useState<PitchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<PitchRequest | null>(null);

  const handleGenerate = async (data: PitchRequest) => {
    setIsLoading(true);
    setError(null);
    setLastRequest(data);
    
    try {
      const response = await generatePitchApi(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastRequest) {
      handleGenerate(lastRequest);
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <div className="header">
        <h1>ProjectPitch</h1>
        <p>Turn your project into a confident interview answer — and handle follow-ups with ease.</p>
      </div>

      {error && (
        <div className="global-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {result && !isLoading && (
        <>
          <PitchResult result={result} context={lastRequest!} onRegenerate={handleRegenerate} isLoading={isLoading} />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-outline" onClick={() => setResult(null)}>
              Start Over with New Project
            </button>
          </div>
        </>
      )}

      {!result && !isLoading && (
        <PitchForm onSubmit={handleGenerate} isLoading={isLoading} />
      )}

      {isLoading && (
         <div style={{ 
             position: result ? 'absolute' : 'static',
             top: result ? '250px' : 'auto',
             left: result ? '0' : 'auto',
             right: result ? '0' : 'auto',
             zIndex: 10
         }}>
            <LoadingSteps />
         </div>
      )}

      {/* If loading and we have a result, show it underneath faded */}
      {result && isLoading && (
        <div style={{ opacity: 0.3, pointerEvents: 'none', filter: 'blur(2px)' }}>
           <PitchResult result={result} context={lastRequest!} onRegenerate={handleRegenerate} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export default App;
