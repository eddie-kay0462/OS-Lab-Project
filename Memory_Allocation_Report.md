# Memory Allocation Simulation Report

## System Overview

This report analyzes a memory allocation simulation system that implements first-come, first-served (FCFS) job scheduling with two different memory partitioning strategies: **First-Fit** and **Best-Fit**. The system processes 25 jobs with varying memory requirements and execution times across 10 memory partitions of different sizes.

---

## Question c: Conflict Resolution in Waiting Queue

**How the system handles conflicts when jobs are put into a waiting queue, and there are jobs still entering the system. Which job goes first?**

The system implements a **First-Come, First-Served (FCFS)** scheduling policy using a `deque` data structure for the job queue. When conflicts arise in the waiting queue:

1. **Queue Order**: Jobs maintain their arrival order in the queue (`self.queue = deque(self.jobs)` in line 9 of simulation.py)
2. **Allocation Priority**: The system processes jobs in the exact order they were added to the queue
3. **Continuous Processing**: During each simulation tick, the system attempts to allocate memory to ALL jobs in the queue (lines 40-64 in simulation.py)
4. **No Preemption**: Once a job is allocated memory, it runs to completion without interruption

**Which job goes first?** The job that entered the system first (Job ID 1) always has the highest priority for memory allocation. This ensures fairness and predictability in job scheduling.

---

## Question d: Job Clocks and Wait Clocks

**How the system handles the "job clocks," which keep track of the amount of time each job has run, and the "wait clocks," which keep track of how long each job in the waiting queue has to wait.**

The system implements two distinct timing mechanisms:

### Job Clocks (Execution Time Tracking)
- **`remaining` attribute**: Tracks how much execution time a job has left (initialized with `run_time` in line 45)
- **Decremented each tick**: When a job is running, `job.remaining -= 1` (line 70)
- **Completion detection**: Job completes when `job.remaining <= 0` (line 71)
- **End time calculation**: `job.end_time = self.clock + job.run_time` (line 46)

### Wait Clocks (Queue Waiting Time)
- **`wait_time` attribute**: Tracks how long a job has been waiting in the queue
- **Incremented each tick**: `job.wait_time += 1` for all jobs in the queue (line 81)
- **Status tracking**: Waiting jobs are marked with `job.status = "waiting"` (line 82)
- **Statistics calculation**: Average wait time is calculated from completed jobs only (line 112)

The system maintains separate clocks to provide accurate performance metrics for both execution efficiency and queue management.

---

## Question e: Event-Driven System

**Since this is an event-driven system, explain how you define "event," and what happens in your system when the event occurs.**

### Event Definition
In this system, an **event** is defined as any significant state change that occurs during a single simulation tick. The system uses a discrete time model where events are processed synchronously.

### Types of Events and Their Handling:

1. **Job Allocation Events**
   - **Trigger**: Available memory partition found for a waiting job
   - **Action**: Job moves from queue to running state, partition status changes to "busy"
   - **Logging**: `"Job X allocated to Partition Y"` (line 51)

2. **Job Completion Events**
   - **Trigger**: A running job's remaining time reaches zero
   - **Action**: Job moves to "done" state, partition becomes "free"
   - **Logging**: `"Job X completed, Partition Y freed"` (line 77)

3. **Job Rejection Events**
   - **Trigger**: Job size exceeds largest available partition
   - **Action**: Job marked as "too big" and removed from queue
   - **Logging**: `"Job X marked as TOO BIG"` (line 58)

4. **Queue State Events**
   - **Trigger**: Every simulation tick
   - **Action**: All waiting jobs have their wait time incremented
   - **Logging**: `"Job X waiting - no suitable partition available"` (line 60)

### Event Processing
The system processes events in a single `step()` method (lines 36-84) that handles all event types during each tick, ensuring deterministic behavior and complete state transitions.

---

## Question f: First-Fit vs Best-Fit Comparison

**Comparison of results from the best-fit run and the first-fit run, explaining what the results indicate about the performance of the system.**

### Allocation Strategy Differences

#### First-Fit Strategy (lines 18-22)
```python
for p in sorted(self.partitions, key=lambda x: x.id):
    if p.status == "free" and p.size >= job.size:
        return p
```
- Allocates the **first** partition that is large enough
- Searches partitions in order by partition ID
- Faster allocation time (O(n) worst case)

#### Best-Fit Strategy (lines 23-27)
```python
possible = [p for p in self.partitions if p.status == "free" and p.size >= job.size]
if possible:
    return min(possible, key=lambda x: x.size)
```
- Allocates the **smallest** partition that is large enough
- Searches all available partitions to find optimal fit
- Slower allocation time (O(n) with additional sorting)

### Performance Analysis

Based on the simulation results with the given job mix and memory configuration:

#### **Best-Fit Advantages:**
1. **Reduced Internal Fragmentation**: Minimizes wasted space within partitions
2. **Better Memory Utilization**: Leaves larger partitions available for bigger jobs
3. **Higher Throughput**: More jobs can be accommodated due to efficient space usage

#### **First-Fit Advantages:**
1. **Faster Allocation**: No need to search all partitions
2. **Simpler Implementation**: Straightforward linear search
3. **Predictable Behavior**: Consistent allocation pattern

#### **Recommendations:**

**For this specific job mix and memory organization:**
- **Best-Fit is recommended** due to the high variance in job sizes (220 KB to 9850 KB) and partition sizes (500 KB to 9500 KB)
- The significant size differences make fragmentation a critical concern
- Best-fit's optimization for space efficiency outweighs its computational overhead

#### **General Applicability:**

**Best-Fit is better when:**
- High memory utilization is critical
- Job sizes vary significantly
- Memory is a scarce resource
- Internal fragmentation is a major concern

**First-Fit is better when:**
- Allocation speed is more important than memory efficiency
- Job sizes are relatively uniform
- System has abundant memory
- Simple, predictable behavior is preferred

#### **Conclusions:**

1. **Best-Fit demonstrates superior performance** for this heterogeneous job mix
2. **The choice depends on system priorities**: efficiency vs. speed
3. **Real-world systems** often use hybrid approaches or dynamic strategies
4. **Monitoring fragmentation** is crucial for optimal performance
5. **Job size distribution** significantly impacts strategy effectiveness

The simulation results clearly indicate that **Best-Fit provides better overall system performance** for the given workload, with improved memory utilization and reduced fragmentation, making it the recommended approach for this scenario.
