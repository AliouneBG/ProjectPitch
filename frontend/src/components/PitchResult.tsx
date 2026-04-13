import React, { useState } from 'react';
import type { PitchResponse, PitchRequest, WeakSpot } from '../api/generate';
import { Copy, Check, RefreshCw, AlertTriangle, Lightbulb, Loader2, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';
import { fetchCoaching, fetchRefinement } from '../api/generate';

interface Props {
  result: PitchResponse;
  context: PitchRequest;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function PitchResult({ result, context, onRegenerate, isLoading }: Props) {
  const sections = [
    { title: 'Simple Explanation', key: 'simpleExplanation', description: 'What does this project do?', refineable: true },
    { title: 'Technical Breakdown', key: 'technicalExplanation', description: 'How does it work technically?', refineable: true },
    { title: '60-Second Interview Answer', key: 'interviewAnswer', description: '"Tell me about this project"', refineable: true },
    { title: 'Engineering Decisions', key: 'engineeringDecisions', description: 'Why certain tools/patterns were used', refineable: false },
    { title: 'Follow-up Questions', key: 'followUpQuestions', description: 'Questions an interviewer might ask', refineable: false }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Your Project Pitch</h2>
        <button onClick={onRegenerate} disabled={isLoading} className="btn-outline">
          <RefreshCw size={18} className={isLoading ? 'spinner' : ''} />
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {result.riskSignals && result.riskSignals.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--accent-orange)', backgroundColor: 'rgba(245, 166, 35, 0.05)', marginBottom: '1.5rem', padding: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', marginTop: 0, fontSize: '1.1rem' }}>
            <AlertCircle size={20} /> Be Ready to Explain
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
            {result.riskSignals.map((r, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{r}</li>)}
          </ul>
        </div>
      )}
      
      {sections.map(({ title, key, description, refineable }) => (
        <SectionCard 
          key={key}
          title={title}
          sectionKey={key}
          description={description}
          initialContent={result[key as keyof PitchResponse]}
          refineable={refineable}
          context={context}
        />
      ))}

      {result.weakSpots && result.weakSpots.length > 0 && (
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-color)', marginTop: '2.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={24} /> Where This Might Break in an Interview
          </h3>
          {result.weakSpots.map((spot, i) => (
             <WeakSpotCard key={i} spot={spot} context={context} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, sectionKey, description, initialContent, refineable, context }: { title: string, sectionKey: string, description: string, initialContent: string | string[], refineable: boolean, context: PitchRequest }) {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [isRefining, setIsRefining] = useState(false);

  // Sync state if initialContent changes due to a full app regeneration
  React.useEffect(() => {
    setContent(initialContent);
    setOriginalContent(initialContent);
  }, [initialContent]);

  const handleCopy = () => {
    const textToCopy = Array.isArray(content) ? content.join('\n') : content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = async (instruction: string) => {
    if (Array.isArray(content)) return;
    setIsRefining(true);
    try {
      const refined = await fetchRefinement(content as string, instruction, sectionKey, context);
      setContent(refined);
    } catch (e: any) {
      alert("Failed to refine text: " + e.message);
    } finally {
      setIsRefining(false);
    }
  };

  const hasChanged = content !== originalContent;

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.2rem' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{description}</p>
        </div>
        <button className="btn-outline" onClick={handleCopy} style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      
      <div style={{ 
        whiteSpace: 'pre-wrap', 
        backgroundColor: 'var(--bg-color)', 
        padding: '1rem', 
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        lineHeight: 1.6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isRefining && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(18,18,18,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
             <Loader2 className="spinner" size={24} style={{ color: 'var(--accent-color)' }} />
          </div>
        )}
        {Array.isArray(content) ? (
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {content.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
            ))}
          </ul>
        ) : (
           content
        )}
      </div>

      {refineable && !Array.isArray(content) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
          <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more concise')} disabled={isRefining}>Make Concise</button>
          <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more technical')} disabled={isRefining}>More Technical</button>
          <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more conversational')} disabled={isRefining}>More Conversational</button>
          <button className="btn-outline refine-btn" onClick={() => handleRefine('Shorten to 30 seconds')} disabled={isRefining}>Shorten (30s)</button>
          
          {hasChanged && (
             <button className="btn-outline refine-btn" onClick={() => setContent(originalContent)} disabled={isRefining} style={{ marginLeft: 'auto', borderStyle: 'dashed' }}>Revert</button>
          )}
        </div>
      )}
    </div>
  );
}

function WeakSpotCard({ spot, context }: { spot: WeakSpot, context: PitchRequest }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);

  const handleCoach = async () => {
    if (suggestion) {
      setSuggestion(null); // toggle off
      return;
    }
    setIsLoadingGuide(true);
    setExample(null); // Optional: close example to avoid clutter
    try {
      const resp = await fetchCoaching(spot, context, 'guide');
      setSuggestion(resp);
    } catch (e: any) {
      alert("Failed to load suggestion: " + e.message);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleExample = async () => {
    if (example) {
      setExample(null); // toggle off
      return;
    }
    setIsLoadingExample(true);
    setSuggestion(null); // Optional: close guide to avoid clutter
    try {
      const resp = await fetchCoaching(spot, context, 'example');
      setExample(resp);
    } catch (e: any) {
      alert("Failed to load sample answer: " + e.message);
    } finally {
      setIsLoadingExample(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: spot.issueType === 'weak' ? '4px solid var(--accent-orange)' : '4px solid var(--error-color)', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
           <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', letterSpacing: '0.5px' }}>{spot.issueType}</span>
              {spot.area}
           </h4>
           <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{spot.message}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={handleCoach} disabled={isLoadingGuide || isLoadingExample} style={{  padding: '0.4rem 0.6rem', fontSize: '0.85rem'  }}>
            {isLoadingGuide ? <Loader2 className="spinner" size={16} /> : <Lightbulb size={16} style={{ color: suggestion ? 'var(--accent-yellow)' : 'inherit' }} />}
            {isLoadingGuide ? 'Thinking...' : suggestion ? 'Hide Tip' : 'How to address this'}
          </button>
          <button className="btn-outline" onClick={handleExample} disabled={isLoadingGuide || isLoadingExample} style={{  padding: '0.4rem 0.6rem', fontSize: '0.85rem'  }}>
            {isLoadingExample ? <Loader2 className="spinner" size={16} /> : <MessageSquare size={16} style={{ color: example ? 'var(--accent-purple)' : 'inherit' }} />}
            {isLoadingExample ? 'Drafting...' : example ? 'Hide Example' : 'See Sample Answer'}
          </button>
        </div>
      </div>

      {suggestion && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-yellow)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}><strong>💡 Tip:</strong> {suggestion}</p>
        </div>
      )}

      {example && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-purple)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}><strong>💬 Sample Answer (Hypothetical):</strong> {example}</p>
        </div>
      )}
    </div>
  );
}
