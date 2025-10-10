import React from 'react';
import { SimulationStatistics } from '../types';

interface StatisticsPanelProps {
  statistics: SimulationStatistics | null;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="statistics-panel">
        <h3>Simulation Statistics</h3>
        <p>Statistics will appear when simulation completes.</p>
      </div>
    );
  }

  const { details } = statistics;

  return (
    <div className="statistics-panel">
      <h3>Final Simulation Statistics</h3>
      <div className="statistics-content" style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #ddd',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div className="stats-summary" style={{ marginBottom: '20px' }}>
          <h4>Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><strong>Strategy:</strong> {statistics.strategy.toUpperCase()}</div>
            <div><strong>Throughput:</strong> {statistics.throughput} jobs</div>
            <div><strong>Avg Wait Time:</strong> {statistics.avgWaitTime?.toFixed(2) || '0.00'} ticks</div>
            <div><strong>Memory Utilization:</strong> {statistics.utilization?.toFixed(1) || '0.0'}%</div>
            <div><strong>Avg Fragmentation:</strong> {statistics.avgInternalFrag?.toFixed(2) || '0.00'} KB</div>
            {statistics.tooBigJobs > 0 && (
              <div><strong>Jobs Too Big:</strong> {statistics.tooBigJobs}</div>
            )}
          </div>
        </div>

        <div className="stats-details">
          <h4>Detailed Calculations</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>1. Throughput:</strong>
            <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
              {details.throughputCalc}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>2. Average Wait Time:</strong>
            <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
              {details.waitTimeCalc}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>3. Memory Utilization:</strong>
            <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
              {details.utilizationCalc}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>4. Internal Fragmentation:</strong>
            <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
              {details.fragmentationCalc}
            </div>
            {details.fragmentationDetails && details.fragmentationDetails.length > 0 && (
              <div style={{ marginLeft: '20px', fontSize: '12px', color: '#888' }}>
                <strong>Detailed breakdown:</strong>
                <ul style={{ margin: '5px 0' }}>
                  {details.fragmentationDetails.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>5. Partition Usage:</strong>
            <div style={{ marginLeft: '20px', fontSize: '12px', color: '#888' }}>
              <ul style={{ margin: '5px 0' }}>
                {details.partitionUsage && details.partitionUsage.length > 0 ? details.partitionUsage.map((usage, index) => (
                  <li key={index}>{usage}</li>
                )) : (
                  <li>No partition usage data available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
