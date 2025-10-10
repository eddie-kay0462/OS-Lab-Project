import React, { useState, useEffect } from 'react';

interface MemoryPartition {
  id: number;
  size: number;
  status: string;
  jobId: number | string;
  useCount: number;
}

interface MemoryVisualizationProps {
  partitions: MemoryPartition[];
  clock: number;
  strategy: string;
}

const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({ 
  partitions, 
  clock, 
  strategy 
}) => {
  const [animatedPartitions, setAnimatedPartitions] = useState<MemoryPartition[]>([]);
  const [highlightedPartition, setHighlightedPartition] = useState<number | null>(null);

  useEffect(() => {
    // Animate partitions appearing
    if (partitions && partitions.length > 0) {
      setAnimatedPartitions(partitions.map((partition, index) => ({
        ...partition,
        animationDelay: index * 100
      })));
    }
  }, [partitions]);

  const getPartitionColor = (partition: MemoryPartition) => {
    if (partition.status === 'free') {
      return '#e5e7eb'; // Light gray for free memory (matches legend)
    }
    
    // Use consistent blue for all allocated partitions (matches legend)
    return '#3b82f6'; // Blue for allocated
  };

  const getPartitionHeight = (size: number) => {
    // Fixed compact height for all partitions
    return 60; // Compact height for better scrolling
  };

  const formatSize = (size: number) => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`;
    }
    return `${size}`;
  };

  return (
    <div className="memory-visualization">
      <div className="panel-header">
        <h3>Memory Partitions</h3>
        <div className="status-bar">
          <span className="time-badge">Time: {clock}</span>
          <span className="strategy-badge">{strategy.toUpperCase()}</span>
        </div>
      </div>

      {partitions && partitions.length > 0 ? (
        <>
          <div className="memory-container">
            <div className="partitions-grid">
              {animatedPartitions.map((partition, index) => (
                <div
                  key={partition.id}
                  className={`partition-card ${partition.status === 'free' ? 'free' : 'allocated'} ${
                    highlightedPartition === partition.id ? 'highlighted' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    height: `${getPartitionHeight(partition.size)}px`,
                    background: getPartitionColor(partition)
                  }}
                  onMouseEnter={() => setHighlightedPartition(partition.id)}
                  onMouseLeave={() => setHighlightedPartition(null)}
                >
                  <div className="partition-header">
                    <span className="partition-id">P{partition.id}</span>
                    <span className="partition-size">{formatSize(partition.size)} KB</span>
                  </div>
                  
                  <div className="partition-content">
                    {partition.status === 'free' ? (
                      <div className="free-indicator">
                        <span className="free-icon material-icons">memory</span>
                        <span className="free-text">Available</span>
                      </div>
                    ) : (
                      <div className="job-info">
                        <div className="job-id">Job {partition.jobId}</div>
                        <div className="job-details">
                          <span className="job-size">{formatSize(partition.size)} KB</span>
                          <span className="use-count">Used {partition.useCount}x</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {partition.status !== 'free' && (
                    <div className="partition-footer">
                      <div className="fragmentation-bar">
                        <div 
                          className="fragmentation-fill"
                          style={{
                            width: `${Math.min((partition.size / Math.max(...partitions.map(p => p.size))) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color free"></div>
              <span>Free Memory</span>
            </div>
            <div className="legend-item">
              <div className="legend-color allocated"></div>
              <span>Allocated</span>
            </div>
            <div className="legend-item">
              <div className="legend-color highlighted"></div>
              <span>Selected</span>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon material-icons">storage</div>
          <h4>No Memory Partitions</h4>
          <p>Initialize the simulation to see memory partitions</p>
        </div>
      )}
    </div>
  );
};

export default MemoryVisualization;