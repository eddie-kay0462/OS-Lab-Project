import statistics
from collections import deque
from models import Job, Partition

class OSSimulation:
    def __init__(self, jobs, partitions, strategy="first-fit"):
        self.partitions = [Partition(i, p) for i, p in enumerate(partitions)] #i is the partition id, p is the partition size
        self.jobs = [Job(*j) for j in jobs] 
        self.queue = deque(self.jobs)
        self.strategy = strategy #first-fit or best-fit
        self.clock = 0
        self.finished_jobs = []
        self.log_events = []  # Store log events
        self.log_event(f"Simulation started with {len(jobs)} jobs and {len(partitions)} partitions using {strategy} strategy")

    # Allocation strategy
    def allocate_partition(self, job):
        if self.strategy == "first-fit":
            # Search partitions in order by address (partition ID)
            for p in sorted(self.partitions, key=lambda x: x.id):
                if p.status == "free" and p.size >= job.size:
                    return p
        elif self.strategy == "best-fit":
            possible = [p for p in self.partitions if p.status == "free" and p.size >= job.size]
            if possible:
                return min(possible, key=lambda x: x.size)
        return None

    def log_event(self, message):
        """Add a log event with timestamp"""
        log_message = f"[T{self.clock:03d}] {message}"
        self.log_events.append(log_message)
        print(log_message)  # Also print to terminal

    #advance the simulation by 1 tick
    def step(self):
        """Advance the simulation by 1 tick"""
        # Try to allocate all possible jobs
        jobs_to_remove = []
        for job in list(self.queue):  # Create a copy to iterate safely
            chosen = self.allocate_partition(job)
            if chosen:
                jobs_to_remove.append(job)
                job.status = "running"
                job.remaining = job.run_time 
                job.end_time = self.clock + job.run_time
                job.assigned_partition = chosen  # Track which partition was assigned
                chosen.status = "busy"
                chosen.job = job
                chosen.use_count += 1
                self.log_event(f"Job {job.id} (size={job.size}) allocated to Partition {chosen.id} (size={chosen.size})")
            else:
                # Check if job is too big for any partition
                max_partition_size = max(p.size for p in self.partitions)
                if job.size > max_partition_size:
                    jobs_to_remove.append(job)
                    job.status = "too big"
                    self.log_event(f"Job {job.id} (size={job.size}) marked as TOO BIG - largest partition is {max_partition_size}")
                else:
                    self.log_event(f"Job {job.id} (size={job.size}) waiting - no suitable partition available")
        
        # Remove allocated jobs and too-big jobs from queue
        for job in jobs_to_remove:
            self.queue.remove(job)

        # Decrement running jobs
        for p in self.partitions:
            if p.status == "busy":
                job = p.job
                job.remaining -= 1
                if job.remaining <= 0:
                    job.status = "done"
                    job.completion = self.clock
                    self.finished_jobs.append(job)
                    p.status = "free"
                    p.job = None
                    self.log_event(f"Job {job.id} completed, Partition {p.id} freed")

        # Update waiting jobs
        for job in self.queue:
            job.wait_time += 1
            job.status = "waiting"

        self.clock += 1

    #check if all jobs are done
    def all_done(self):
        return all(j.status in ("done", "too big") for j in self.jobs)

    #get the snapshot of the job and memory table
    def get_snapshot(self):
        """Return job + memory table snapshot for GUI"""
        job_table = [
            (j.id, j.size, j.run_time, j.status, j.wait_time, j.completion if j.completion else "--")
            for j in self.jobs
        ]
        mem_table = [
            (p.id, p.size, p.status, p.job.id if p.job else "--", p.use_count)
            for p in self.partitions
        ]
        return job_table, mem_table

    #get the most recent log events
    def get_recent_logs(self, count=10):
        """Get the most recent log events"""
        return self.log_events[-count:] if self.log_events else []

    #get the statistics of the simulation
    def statistics(self):
        # Count successfully completed jobs (not including "too big" jobs)
        throughput = len(self.finished_jobs)
        avg_wait = statistics.mean([j.wait_time for j in self.finished_jobs]) if self.finished_jobs else 0
        utilization = (sum(1 for p in self.partitions if p.use_count > 0) / len(self.partitions)) * 100
        # Calculate internal fragmentation for finished jobs
        frag_values = []
        for job in self.finished_jobs:
            if job.assigned_partition:
                frag_values.append(job.assigned_partition.size - job.size)
        avg_frag = statistics.mean(frag_values) if frag_values else 0
        
        # Count jobs that were too big
        too_big_jobs = [j for j in self.jobs if j.status == "too big"]
        
        # Log summary of too-big jobs
        if too_big_jobs:
            self.log_event(f"SUMMARY: {len(too_big_jobs)} jobs were too large to allocate:")
            for job in too_big_jobs:
                self.log_event(f"   - Job {job.id}: size {job.size} KB (largest partition: {max(p.size for p in self.partitions)} KB)")
        
        # Calculate detailed statistics for display
        stats_details = self.calculate_detailed_stats()
        
        return {
            "strategy": self.strategy,
            "throughput": throughput,
            "avg_wait_time": avg_wait,
            "utilization %": utilization,
            "avg_internal_frag": avg_frag,
            "too_big_jobs": len(too_big_jobs),
            "details": stats_details
        }
    
    def calculate_detailed_stats(self):
        """Calculate detailed statistics with explanations"""
        details = {}
        
        # Throughput calculation
        too_big_count = len([j for j in self.jobs if j.status == "too big"])
        details["throughput_calc"] = f"Throughput = {len(self.finished_jobs)} jobs completed (out of {len(self.jobs)} total jobs)"
        if too_big_count > 0:
            details["throughput_calc"] += f"\n   Note: {too_big_count} jobs were too big for any partition"
        
        # Wait time calculation
        if self.finished_jobs:
            wait_times = [j.wait_time for j in self.finished_jobs]
            details["wait_time_calc"] = f"Avg Wait Time = {statistics.mean(wait_times):.2f} ticks (from jobs: {wait_times})"
        else:
            details["wait_time_calc"] = "Avg Wait Time = 0 (no completed jobs)"
        
        # Utilization calculation
        used_partitions = sum(1 for p in self.partitions if p.use_count > 0)
        total_partitions = len(self.partitions)
        details["utilization_calc"] = f"Utilization = {used_partitions}/{total_partitions} partitions used = {(used_partitions/total_partitions)*100:.1f}%"
        
        # Fragmentation calculation
        frag_values = []
        frag_details = []
        for job in self.finished_jobs:
            if job.assigned_partition:
                frag = job.assigned_partition.size - job.size
                frag_values.append(frag)
                frag_details.append(f"Job {job.id}: {job.assigned_partition.size} - {job.size} = {frag}")
        
        if frag_values:
            details["fragmentation_calc"] = f"Avg Fragmentation = {statistics.mean(frag_values):.2f} KB"
            details["fragmentation_details"] = frag_details
        else:
            details["fragmentation_calc"] = "Avg Fragmentation = 0 (no completed jobs)"
        
        # Partition usage analysis
        partition_usage = []
        for p in self.partitions:
            partition_usage.append(f"Partition {p.id} (size={p.size}): used {p.use_count} times")
        details["partition_usage"] = partition_usage
        
        return details
