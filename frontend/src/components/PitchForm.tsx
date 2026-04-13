import React, { useState } from 'react';
import type { PitchRequest } from '../api/generate';
import { Loader2, Wand2 } from 'lucide-react';

interface Props {
  onSubmit: (data: PitchRequest) => void;
  isLoading: boolean;
}

export function PitchForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<PitchRequest>({
    projectName: '',
    projectSummary: '',
    projectDescription: '',
    techStack: '',
    keyFeatures: '',
    technicalChallenge: '',
    targetRole: '',
    targetCompanyType: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PitchRequest, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof PitchRequest, string>> = {};
    if (!formData.projectName.trim()) newErrors.projectName = 'This field is required';
    if (!formData.projectSummary.trim()) newErrors.projectSummary = 'This field is required';
    if (formData.projectDescription.trim().length < 10) newErrors.projectDescription = 'Description must be at least 10 characters';
    if (!formData.techStack.trim()) newErrors.techStack = 'This field is required';
    if (!formData.keyFeatures.trim()) newErrors.keyFeatures = 'This field is required';
    if (!formData.technicalChallenge.trim()) newErrors.technicalChallenge = 'This field is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof PitchRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const fillExample = () => {
    setFormData({
      projectName: 'BudgetSync',
      projectSummary: 'A real-time budgeting app that helps freelancers track expenses and tax liabilities instantly.',
      projectDescription: 'Freelancers struggle to know how much they owe in taxes until tax season. I built this app so users can link their bank accounts via Plaid and instantly see real-time categorizations and tax liability splits. It features a dashboard, expense tagging, and PDF export.',
      techStack: 'React, Node.js, Express, PostgreSQL, Plaid API',
      keyFeatures: 'Bank account linking via Plaid, real-time transaction syncing, automated tax liability calculation, PDF report export.',
      technicalChallenge: 'Syncing thousands of transactions efficiently without hitting Plaid rate limits. I solved this by implementing a webhook-based architecture that queues updates in Redis and processes them in background workers, caching results in PostgreSQL.',
      targetRole: 'Full-Stack Developer',
      targetCompanyType: 'Fintech Startup'
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Project Details</h2>
        <button type="button" onClick={fillExample} disabled={isLoading} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          <Wand2 size={16} /> Fill with example
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: 0 }}>
        Provide the raw details of your project, and we'll translate it into a structured pitch.
      </p>

      <div className="input-group">
        <label>Project Name <span>*</span></label>
        <input 
          name="projectName" 
          value={formData.projectName} 
          onChange={handleChange} 
          disabled={isLoading} 
          placeholder="e.g. ProjectPitch" 
          className={errors.projectName ? 'has-error' : ''}
        />
        {errors.projectName && <div className="error-text">{errors.projectName}</div>}
      </div>

      <div className="input-group">
        <label>One-line Summary <span>*</span></label>
        <input 
          name="projectSummary" 
          value={formData.projectSummary} 
          onChange={handleChange} 
          disabled={isLoading} 
          placeholder="What does your project do and who is it for? (e.g., A budgeting app that helps users track expenses in real time)" 
          className={errors.projectSummary ? 'has-error' : ''}
        />
        {errors.projectSummary && <div className="error-text">{errors.projectSummary}</div>}
      </div>

      <div className="input-group">
        <label>Full Description <span>*</span></label>
        <textarea 
          name="projectDescription" 
          value={formData.projectDescription} 
          onChange={handleChange} 
          disabled={isLoading} 
          rows={4} 
          placeholder="Describe your project in your own words—don't worry about structure. Just explain what it does, why you built it, and how it works." 
          className={errors.projectDescription ? 'has-error' : ''}
        />
        {errors.projectDescription && <div className="error-text">{errors.projectDescription}</div>}
      </div>

      <div className="input-group">
        <label>Tech Stack <span>*</span></label>
        <input 
          name="techStack" 
          value={formData.techStack} 
          onChange={handleChange} 
          disabled={isLoading} 
          placeholder="React, Node.js, PostgreSQL" 
          className={errors.techStack ? 'has-error' : ''}
        />
        {errors.techStack && <div className="error-text">{errors.techStack}</div>}
      </div>

      <div className="input-group">
        <label>Key Features <span>*</span></label>
        <textarea 
          name="keyFeatures" 
          value={formData.keyFeatures} 
          onChange={handleChange} 
          disabled={isLoading} 
          rows={3} 
          placeholder="List a few key features (rough is fine)" 
          className={errors.keyFeatures ? 'has-error' : ''}
        />
        {errors.keyFeatures && <div className="error-text">{errors.keyFeatures}</div>}
      </div>

      <div className="input-group">
        <label>Biggest Technical Challenge <span>*</span></label>
        <textarea 
          name="technicalChallenge" 
          value={formData.technicalChallenge} 
          onChange={handleChange} 
          disabled={isLoading} 
          rows={3} 
          placeholder="What was the hardest part? Even a rough explanation helps." 
          className={errors.technicalChallenge ? 'has-error' : ''}
        />
        {errors.technicalChallenge && <div className="error-text">{errors.technicalChallenge}</div>}
      </div>

      <h3 style={{ marginTop: '2rem' }}>Optional Context</h3>
      
      <div className="input-group">
        <label>Target Role</label>
        <input name="targetRole" value={formData.targetRole} onChange={handleChange} disabled={isLoading} placeholder="e.g. Senior Frontend Engineer" />
      </div>

      <div className="input-group">
        <label>Target Company Type</label>
        <input name="targetCompanyType" value={formData.targetCompanyType} onChange={handleChange} disabled={isLoading} placeholder="e.g. B2B SaaS, Early Stage Startup" />
      </div>

      <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '1.05rem' }}>
        {isLoading ? (
          <><Loader2 className="spinner" size={20} /> Generating...</>
        ) : (
          'Generate Interview-Ready Explanation'
        )}
      </button>
      
      <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
        <span className="help-text">Takes ~10–30 seconds</span>
      </div>
    </form>
  );
}
