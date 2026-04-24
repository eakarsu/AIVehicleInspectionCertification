import React from 'react';
import ReactMarkdown from 'react-markdown';

function AIAnalysisDisplay({ analysis, loading }) {
  if (loading) {
    return (
      <div className="ai-analysis-card">
        <div className="ai-loading">
          <div className="spinner"></div>
          <p>AI is analyzing... This may take a moment</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const content = typeof analysis === 'object' ? analysis.analysis : analysis;
  const model = typeof analysis === 'object' ? analysis.model : null;
  const analyzedAt = typeof analysis === 'object' ? analysis.analyzedAt : null;

  return (
    <div className="ai-analysis-card">
      <div className="ai-analysis-header">
        <div className="ai-icon">🤖</div>
        <div>
          <h3>AI Analysis Report</h3>
          {analyzedAt && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Generated {new Date(analyzedAt).toLocaleString()}
            </span>
          )}
        </div>
        {model && <span className="ai-model">{model}</span>}
      </div>
      <div className="ai-analysis-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default AIAnalysisDisplay;
