import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Parsing project details...', duration: 2000 },
  { id: 2, label: 'Structuring interview answer...', duration: 4000 },
  { id: 3, label: 'Identifying weak spots...', duration: 6000 }
];

export function LoadingSteps() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    // Step 2
    timeoutIds.push(setTimeout(() => {
      setCurrentStepIndex(1);
    }, STEPS[0].duration));

    // Step 3
    timeoutIds.push(setTimeout(() => {
      setCurrentStepIndex(2);
    }, STEPS[0].duration + STEPS[1].duration));

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '2rem', textAlign: 'center', fontSize: '1.4rem' }}>
        Crafting your pitch
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div 
              key={step.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                opacity: isPending ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
                transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {isCompleted ? (
                <CheckCircle2 color="var(--success-color, #10b981)" size={24} />
              ) : isCurrent ? (
                <Loader2 className="spinner" color="var(--primary-color, #3b82f6)" size={24} />
              ) : (
                <Circle color="var(--text-secondary, #6b7280)" size={24} />
              )}
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: isCurrent ? 500 : 400,
                color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
