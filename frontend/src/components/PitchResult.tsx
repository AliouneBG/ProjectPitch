import React, { useState } from 'react';
import type { PitchResponse, PitchRequest, WeakSpot } from '../api/generate';
import { Copy, Check, RefreshCw, AlertTriangle, Lightbulb, Loader2, Sparkles, AlertCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { fetchCoaching, fetchRefinement } from '../api/generate';

interface Props {
  result: PitchResponse;
  context: PitchRequest;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function PitchResult({ result, context, onRegenerate, isLoading }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Your Results</h2>
        <button onClick={onRegenerate} disabled={isLoading} className="btn-outline">
          <RefreshCw size={18} className={isLoading ? 'spinner' : ''} />
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* RISK SIGNALS — compact banner */}
      {result.riskSignals && result.riskSignals.length > 0 && (
        <div className="risk-banner">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Be ready to explain:</strong>{' '}
            {result.riskSignals.join(' · ')}
          </div>
        </div>
      )}

      {/* HERO — Interview Answer */}
      {/* WOW MOMENT FRAMING */}
      <p className="hero-framing">Here's a confident interview answer you can use:</p>

      <HeroAnswerCard
        content={result.interviewAnswer}
        context={context}
      />

      {/* SIMPLE EXPLANATION — open by default */}
      <CollapsibleSection
        title="Simple Explanation"
        description="What does this project do?"
        defaultOpen={true}
      >
        <SectionContent
          sectionKey="simpleExplanation"
          initialContent={result.simpleExplanation}
          refineable={true}
          context={context}
        />
      </CollapsibleSection>

      {/* TECHNICAL BREAKDOWN — collapsed */}
      <CollapsibleSection
        title="Technical Breakdown"
        description="How does it work technically?"
        defaultOpen={false}
      >
        <SectionContent
          sectionKey="technicalExplanation"
          initialContent={result.technicalExplanation}
          refineable={true}
          context={context}
        />
      </CollapsibleSection>

      {/* ENGINEERING DECISIONS — collapsed */}
      <CollapsibleSection
        title="Engineering Decisions"
        description="Why certain tools/patterns were used"
        defaultOpen={false}
      >
        <SectionContent
          sectionKey="engineeringDecisions"
          initialContent={result.engineeringDecisions}
          refineable={false}
          context={context}
        />
      </CollapsibleSection>

      {/* FOLLOW-UP QUESTIONS — collapsed */}
      <CollapsibleSection
        title="Follow-up Questions"
        description="Questions an interviewer might ask"
        defaultOpen={false}
      >
        <SectionContent
          sectionKey="followUpQuestions"
          initialContent={result.followUpQuestions}
          refineable={false}
          context={context}
        />
      </CollapsibleSection>

      {/* WEAK SPOTS — collapsed with badge */}
      {result.weakSpots && result.weakSpots.length > 0 && (
        <CollapsibleSection
          title="Where This Might Break in an Interview"
          description={`${result.weakSpots.length} potential weak spot${result.weakSpots.length > 1 ? 's' : ''} interviewers may ask about`}
          defaultOpen={false}
          icon={<AlertTriangle size={20} style={{ color: 'var(--error-color)' }} />}
          accentColor="var(--error-color)"
        >
          {result.weakSpots.map((spot, i) => (
            <WeakSpotCard key={i} spot={spot} context={context} />
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
}

/* ─── HERO ANSWER CARD ─────────────────────────────────── */

function HeroAnswerCard({ content, context }: { content: string, context: PitchRequest }) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(content);
  const [original, setOriginal] = useState(content);
  const [isRefining, setIsRefining] = useState(false);

  React.useEffect(() => {
    setText(content);
    setOriginal(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = async (instruction: string) => {
    setIsRefining(true);
    try {
      const refined = await fetchRefinement(text, instruction, 'interviewAnswer', context);
      setText(refined);
    } catch (e: any) {
      alert("Failed to refine: " + e.message);
    } finally {
      setIsRefining(false);
    }
  };

  const hasChanged = text !== original;

  return (
    <div className="hero-answer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 className="hero-answer-title">🎯 Your Interview Answer</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>"Tell me about this project"</p>
        </div>
        <button className="btn-outline" onClick={handleCopy} style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="hero-answer-body" style={{ position: 'relative', overflow: 'hidden' }}>
        {isRefining && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(18,18,18,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <Loader2 className="spinner" size={24} style={{ color: 'var(--accent-color)' }} />
          </div>
        )}
        {text}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
        <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
        <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more concise')} disabled={isRefining}>Make Concise</button>
        <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more technical')} disabled={isRefining}>More Technical</button>
        <button className="btn-outline refine-btn" onClick={() => handleRefine('Make it more conversational')} disabled={isRefining}>More Conversational</button>
        <button className="btn-outline refine-btn" onClick={() => handleRefine('Shorten to 30 seconds')} disabled={isRefining}>Shorten (30s)</button>
        {hasChanged && (
          <button className="btn-outline refine-btn" onClick={() => setText(original)} disabled={isRefining} style={{ marginLeft: 'auto', borderStyle: 'dashed' }}>Revert</button>
        )}
      </div>
    </div>
  );
}

/* ─── COLLAPSIBLE SECTION ─────────────────────────────── */

function CollapsibleSection({ title, description, children, defaultOpen = false, icon, badge, accentColor }: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: number;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        type="button"
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
        style={accentColor ? { color: accentColor } : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          {icon}
          <span className="collapsible-title">{title}</span>
          {badge != null && <span className="badge">{badge}</span>}
          {description && <span className="collapsible-desc">{description}</span>}
        </div>
        <ChevronDown
          size={18}
          style={{
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            color: 'var(--text-secondary)'
          }}
        />
      </button>

      <div className={`collapsible-body ${isOpen ? 'collapsible-body--open' : ''}`}>
        <div className="collapsible-body-inner" style={{ paddingTop: '1rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION CONTENT (text/list + copy + refine) ──────── */

function SectionContent({ sectionKey, initialContent, refineable, context }: {
  sectionKey: string;
  initialContent: string | string[];
  refineable: boolean;
  context: PitchRequest;
}) {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [isRefining, setIsRefining] = useState(false);

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button className="btn-outline" onClick={handleCopy} style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.8rem', alignItems: 'center' }}>
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

/* ─── WEAK SPOT CARD ──────────────────────────────────── */

function WeakSpotCard({ spot, context }: { spot: WeakSpot, context: PitchRequest }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);

  const handleCoach = async () => {
    if (suggestion) {
      setSuggestion(null);
      return;
    }
    setIsLoadingGuide(true);
    setExample(null);
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
      setExample(null);
      return;
    }
    setIsLoadingExample(true);
    setSuggestion(null);
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
