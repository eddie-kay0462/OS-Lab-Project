import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { simulationAPI } from './api';
import { SimulationSnapshot, SimulationConfig } from './types';
import MemoryVisualization from './components/MemoryVisualization';
import JobTable from './components/JobTable';
import SimulationLog from './components/SimulationLog';
import StatisticsPanel from './components/StatisticsPanel';

const App: React.FC = () => {
  const [simulation, setSimulation] = useState<SimulationSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const isSteppingRef = useRef(false);


  // Initialize simulation
  const initializeSimulation = useCallback(async (strategy: 'first-fit' | 'best-fit' = 'first-fit') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const config: SimulationConfig = { 
        jobs: [[1,5760,5],[2,4190,4],[3,3290,3],[4,2030,2],[5,2550,1],[6,6990,6],[7,8940,7],[8,740,1],[9,3930,7],[10,6890,5],[11,6580,4],[12,3820,3],[13,9140,8],[14,420,1],[15,220,1],[16,7540,6],[17,3210,4],[18,1380,2],[19,9850,9],[20,3610,3],[21,7540,6],[22,2710,2],[23,8390,7],[24,5950,5],[25,760,1]] as [number, number, number][],
        partitions: [9500,7000,4500,8500,3000,9000,1000,5500,1500,500],
        strategy 
      };
      await simulationAPI.initialize(config);
      const snapshot = await simulationAPI.getSnapshot();
      setSimulation(snapshot);
      setIsRunning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize simulation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Execute one simulation step
  const stepSimulation = useCallback(async () => {
    if (!simulation || simulation.isDone || isSteppingRef.current) return;

    isSteppingRef.current = true;
    setIsLoading(true);
    try {
      const snapshot = await simulationAPI.step();
      setSimulation(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute simulation step');
    } finally {
      setIsLoading(false);
      isSteppingRef.current = false;
    }
  }, [simulation]);

  // Run simulation to completion
  const runCompleteSimulation = async () => {
    if (!simulation) return;

    setIsRunning(true);
    setIsLoading(true);
    try {
      const snapshot = await simulationAPI.runComplete();
      setSimulation(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run complete simulation');
    } finally {
      setIsLoading(false);
      setIsRunning(false);
    }
  };

  // Reset simulation
  const resetSimulation = async () => {
    setIsLoading(true);
    try {
      await simulationAPI.reset();
      const snapshot = await simulationAPI.getSnapshot();
      setSimulation(snapshot);
      setIsRunning(false);
      setAutoRun(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset simulation');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run simulation with steps
  useEffect(() => {
    if (autoRun && simulation && !simulation.isDone && !isSteppingRef.current) {
      const timer = setTimeout(() => {
        stepSimulation();
      }, 1000); // 1 second delay between steps

      return () => clearTimeout(timer);
    }
  }, [autoRun, simulation]); // Depend on simulation object to trigger after each step

  // Initialize simulation on component mount
  useEffect(() => {
    initializeSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStrategyChange = (strategy: 'first-fit' | 'best-fit') => {
    initializeSimulation(strategy);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="title-section">
            <h1>
              <span className="title-main">Memory Allocation</span>
              <span className="title-sub">Simulator</span>
            </h1>
            <p className="subtitle">Interactive visualization of First-Fit and Best-Fit algorithms</p>
          </div>
          <div className="header-stats">
            {simulation && (
              <>
                <div className="stat-item">
                  <span className="stat-value">{simulation.clock}</span>
                  <span className="stat-label">Time</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{simulation.jobTable?.length || 0}</span>
                  <span className="stat-label">Jobs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{simulation.memoryTable?.length || 0}</span>
                  <span className="stat-label">Partitions</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="controls-modern">
        <div className="controls-left">
          <div className="strategy-selector-modern">
            <label>Allocation Strategy</label>
            <div className="strategy-toggle">
              <button 
                className={`strategy-btn ${(simulation?.strategy || 'first-fit') === 'first-fit' ? 'active' : ''}`}
                onClick={() => handleStrategyChange('first-fit')}
                disabled={isLoading}
              >
                First-Fit
              </button>
              <button 
                className={`strategy-btn ${(simulation?.strategy || 'first-fit') === 'best-fit' ? 'active' : ''}`}
                onClick={() => handleStrategyChange('best-fit')}
                disabled={isLoading}
              >
                Best-Fit
              </button>
            </div>
          </div>
        </div>

        <div className="controls-right">
          <div className="button-group">
            <button 
              className="control-btn primary" 
              onClick={stepSimulation}
              disabled={!simulation || simulation.isDone || isLoading}
            >
              <span className="btn-icon material-icons">play_arrow</span>
              Step Forward
            </button>
            <button 
              className={`control-btn ${autoRun ? 'warning' : 'success'}`}
              onClick={() => setAutoRun(!autoRun)}
              disabled={!simulation || simulation.isDone || isLoading}
            >
              <span className="btn-icon material-icons">{autoRun ? 'pause' : 'play_circle'}</span>
              {autoRun ? 'Pause' : 'Auto-Run'}
            </button>
            <button 
              className="control-btn info" 
              onClick={runCompleteSimulation}
              disabled={!simulation || simulation.isDone || isLoading || isRunning}
            >
              <span className="btn-icon material-icons">fast_forward</span>
              Complete
            </button>
            <button 
              className="control-btn secondary" 
              onClick={resetSimulation}
              disabled={isLoading}
            >
              <span className="btn-icon material-icons">refresh</span>
              Reset
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner-modern"></div>
            <span>Initializing simulation...</span>
          </div>
        )}
        {error && (
          <div className="error-toast">
            <span className="error-icon material-icons">warning</span>
            {error}
          </div>
        )}
      </div>

      {simulation ? (
        <div className="simulation-content">
          <div className="main-panels">
            <div className="left-panel">
              <MemoryVisualization 
                partitions={simulation.memoryTable ? simulation.memoryTable.map(([id, size, status, jobId, useCount]) => ({
                  id, size, status, jobId, useCount
                })) : []}
                clock={simulation.clock || 0}
                strategy={simulation.strategy || 'first-fit'}
              />
            </div>

            <div className="right-panel">
              <JobTable 
                jobs={simulation.jobTable || []}
                clock={simulation.clock || 0}
                strategy={simulation.strategy || 'first-fit'}
              />
            </div>
          </div>

          <div className="bottom-panels">
            <SimulationLog logs={simulation.recentLogs || []} />
            <StatisticsPanel statistics={simulation.statistics || null} />
          </div>
        </div>
      ) : (
        <div className="loading-screen">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h3>Initializing Simulation...</h3>
            <p>Setting up memory allocation simulator</p>
            {isLoading && <div className="spinner">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;