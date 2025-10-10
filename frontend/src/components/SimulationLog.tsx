import React, { useEffect, useRef } from 'react';

interface SimulationLogProps {
  logs: string[];
}

const SimulationLog: React.FC<SimulationLogProps> = ({ logs }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="simulation-log">
      <h3>Simulation Log</h3>
      <div
        ref={logRef}
        className="log-content"
        style={{
          height: '300px',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            No simulation events yet...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulationLog;
