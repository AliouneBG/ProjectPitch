import { useState } from 'react';
import { PitchForm } from './components/PitchForm';
import { PitchResult } from './components/PitchResult';
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
    <div className="container">
      <div className="header">
        <h1>ProjectPitch</h1>
        <p>Turn your messy project description into a clear, interview-ready explanation.</p>
      </div>

      {error && (
        <div className="global-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {result && !isLoading && !error ? (
        <>
          <PitchResult result={result} context={lastRequest!} onRegenerate={handleRegenerate} isLoading={isLoading} />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-outline" onClick={() => setResult(null)}>
              Start Over with New Project
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: result ? 'none' : 'block' }}>
          <PitchForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>
      )}
      
      {/* If loading and we have a result, show it underneath with a loading overlay/state */}
      {result && isLoading && !error && (
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
           <PitchResult result={result} context={lastRequest!} onRegenerate={handleRegenerate} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export default App;
