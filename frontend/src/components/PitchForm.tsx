import React, { useState } from 'react';
import type { PitchRequest } from '../api/generate';
import { Loader2, Wand2, ChevronDown } from 'lucide-react';

interface Props {
  onSubmit: (data: PitchRequest) => void;
  isLoading: boolean;
}

export function PitchForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<PitchRequest>({
    projectDescription: '',
    projectName: '',
    projectSummary: '',
    techStack: '',
    keyFeatures: '',
    technicalChallenge: '',
    targetRole: '',
    targetCompanyType: ''
  });

  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const fillExample = () => {
    setFormData({
      projectDescription: 'Freelancers struggle to know how much they owe in taxes until tax season. I built this app so users can link their bank accounts via Plaid and instantly see real-time categorizations and tax liability splits. It features a dashboard, expense tagging, and PDF export.',
      projectName: 'BudgetSync',
      projectSummary: 'A real-time budgeting app that helps freelancers track expenses and tax liabilities instantly.',
      techStack: 'React, Node.js, Express, PostgreSQL, Plaid API',
      keyFeatures: 'Bank account linking via Plaid, real-time transaction syncing, automated tax liability calculation, PDF report export.',
      technicalChallenge: 'Syncing thousands of transactions efficiently without hitting Plaid rate limits. I solved this by implementing a webhook-based architecture that queues updates in Redis and processes them in background workers, caching results in PostgreSQL.',
      targetRole: 'Full-Stack Developer',
      targetCompanyType: 'Fintech Startup'
    });
    setShowOptional(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = formData.projectDescription.trim();
    if (desc.length < 30) {
      setError('Please describe your project in at least a few sentences.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>Describe Your Project</h2>
        <button type="button" onClick={fillExample} disabled={isLoading} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          <Wand2 size={16} /> Try an example
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '0.3rem' }}>
        Just paste your project description — we'll handle the rest.
      </p>

      {/* PRIMARY INPUT */}
      <div className="input-group">
        <textarea
          name="projectDescription"
          value={formData.projectDescription}
          onChange={handleChange}
          disabled={isLoading}
          rows={6}
          placeholder={"Describe your project in your own words. What does it do? Why did you build it? How does it work? What tech did you use?\n\nExample: \"I built a budgeting app for freelancers using React and Node. It links to bank accounts via Plaid, categorizes transactions in real time, and shows estimated tax liability...\""}
          className={error ? 'has-error' : ''}
          style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
        />
        {error && <div className="error-text">{error}</div>}
      </div>

      {/* COLLAPSIBLE OPTIONAL SECTION */}
      <button
        type="button"
        className="optional-fields-toggle"
        onClick={() => setShowOptional(!showOptional)}
        disabled={isLoading}
      >
        <ChevronDown
          size={18}
          style={{
            transition: 'transform 0.25s ease',
            transform: showOptional ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
        Improve Accuracy (Optional)
      </button>

      <div className={`collapsible-body ${showOptional ? 'collapsible-body--open' : ''}`}>
        <div className="collapsible-body-inner">
          <div className="input-group">
            <label>Project Name</label>
            <input name="projectName" value={formData.projectName} onChange={handleChange} disabled={isLoading} placeholder="e.g. BudgetSync" />
          </div>

          <div className="input-group">
            <label>One-line Summary</label>
            <input name="projectSummary" value={formData.projectSummary} onChange={handleChange} disabled={isLoading} placeholder="What does your project do and who is it for?" />
          </div>

          <div className="input-group">
            <label>Tech Stack</label>
            <input name="techStack" value={formData.techStack} onChange={handleChange} disabled={isLoading} placeholder="React, Node.js, PostgreSQL" />
          </div>

          <div className="input-group">
            <label>Key Features</label>
            <textarea name="keyFeatures" value={formData.keyFeatures} onChange={handleChange} disabled={isLoading} rows={2} placeholder="List a few key features (rough is fine)" />
          </div>

          <div className="input-group">
            <label>Biggest Technical Challenge</label>
            <textarea name="technicalChallenge" value={formData.technicalChallenge} onChange={handleChange} disabled={isLoading} rows={2} placeholder="What was the hardest part?" />
          </div>

          <div className="input-group">
            <label>Target Role</label>
            <input name="targetRole" value={formData.targetRole} onChange={handleChange} disabled={isLoading} placeholder="e.g. Senior Frontend Engineer" />
          </div>

          <div className="input-group">
            <label>Target Company Type</label>
            <input name="targetCompanyType" value={formData.targetCompanyType} onChange={handleChange} disabled={isLoading} placeholder="e.g. B2B SaaS, Early Stage Startup" />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1.2rem', padding: '0.85rem', fontSize: '1.08rem' }}>
        {isLoading ? (
          <><Loader2 className="spinner" size={20} /> Generating...</>
        ) : (
          'Generate My Answer'
        )}
      </button>

      <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
        <span className="social-proof">Helps you sound clear, confident, and defensible</span>
      </div>
    </form>
  );
}
