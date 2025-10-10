import React, { useState, useEffect } from 'react';

interface Job {
  id: number;
  size: number;
  runTime: number;
  status: string;
  waitTime: number;
  completion: number | string;
}

interface JobTableProps {
  jobs: [number, number, number, string, number, number | string][];
  clock: number;
  strategy: string;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, clock, strategy }) => {
  const [animatedJobs, setAnimatedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const jobObjects: Job[] = jobs.map(([id, size, runTime, status, waitTime, completion]) => ({
        id,
        size,
        runTime,
        status,
        waitTime,
        completion
      }));
      
      setAnimatedJobs(jobObjects.map((job, index) => ({
        ...job,
        animationDelay: index * 50
      })));
    }
  }, [jobs]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return '#10b981';
      case 'running':
        return '#3b82f6';
      case 'waiting':
        return '#f59e0b';
      case 'too big':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'check_circle';
      case 'running':
        return 'play_circle';
      case 'waiting':
        return 'schedule';
      case 'too big':
        return 'error';
      default:
        return 'help';
    }
  };

  const formatSize = (size: number) => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`;
    }
    return `${size}`;
  };

  return (
    <div className="job-table">
      <div className="panel-header">
        <h3>Job Queue</h3>
        <div className="status-bar">
          <span className="time-badge">Time: {clock}</span>
          <span className="strategy-badge">{strategy.toUpperCase()}</span>
        </div>
      </div>

      {jobs && jobs.length > 0 ? (
        <>
          <div className="table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Size</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Wait Time</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {animatedJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className={`job-row ${job.status.toLowerCase()} ${
                      selectedJob === job.id ? 'selected' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 30}ms`
                    }}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <td className="job-id-cell">
                      <span className="job-id-badge">#{job.id}</span>
                    </td>
                    <td className="job-size-cell">
                      <div className="size-info">
                        <span className="size-value">{formatSize(job.size)} KB</span>
                        <div className="size-bar">
                          <div 
                            className="size-fill"
                            style={{
                              width: `${Math.min((job.size / Math.max(...jobs.map(j => j[1]))) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="job-duration-cell">
                      <span className="duration-badge">{job.runTime}s</span>
                    </td>
                    <td className="job-status-cell">
                      <div 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(job.status) }}
                      >
                        <span className="status-icon material-icons">{getStatusIcon(job.status)}</span>
                        <span className="status-text">{job.status}</span>
                      </div>
                    </td>
                    <td className="job-wait-cell">
                      <span className={`wait-time ${job.waitTime > 0 ? 'has-wait' : ''}`}>
                        {job.waitTime}s
                      </span>
                    </td>
                    <td className="job-completion-cell">
                      {job.completion && job.completion !== 'N/A' ? (
                        <span className="completion-badge">
                          T{job.completion}
                        </span>
                      ) : (
                        <span className="completion-placeholder">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="job-stats">
            <div className="stat-item">
              <span className="stat-label">Total Jobs:</span>
              <span className="stat-value">{jobs.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">
                {jobs.filter(job => job[3].toLowerCase() === 'done').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Waiting:</span>
              <span className="stat-value">
                {jobs.filter(job => job[3].toLowerCase() === 'waiting').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Too Big:</span>
              <span className="stat-value">
                {jobs.filter(job => job[3].toLowerCase() === 'too big').length}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon material-icons">assignment</div>
          <h4>No Jobs Available</h4>
          <p>Initialize the simulation to see job queue</p>
        </div>
      )}
    </div>
  );
};

export default JobTable;