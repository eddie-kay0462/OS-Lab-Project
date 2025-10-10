export interface Job {
  id: number;
  size: number;
  runTime: number;
  status: string;
  waitTime: number;
  completion: number | string;
}

export interface MemoryPartition {
  id: number;
  size: number;
  status: string;
  jobId: number | string;
  useCount: number;
}

export interface SimulationSnapshot {
  clock: number;
  isDone: boolean;
  strategy: string;
  jobTable: [number, number, number, string, number, number | string][];
  memoryTable: [number, number, string, number | string, number][];
  recentLogs: string[];
  statistics?: SimulationStatistics;
}

export interface SimulationStatistics {
  strategy: string;
  throughput: number;
  avgWaitTime: number;
  utilization: number;
  avgInternalFrag: number;
  tooBigJobs: number;
  details: {
    throughputCalc: string;
    waitTimeCalc: string;
    utilizationCalc: string;
    fragmentationCalc: string;
    fragmentationDetails?: string[];
    partitionUsage: string[];
  };
}

export interface SimulationConfig {
  jobs: [number, number, number][]; // [id, size, runTime]
  partitions: number[];
  strategy: 'first-fit' | 'best-fit';
}
