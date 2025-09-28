import tkinter as tk
import threading
import time
from simulation import OSSimulation

class MemorySimApp:
    def __init__(self, root, jobs, partitions, strategy="best-fit"):
        self.root = root
        self.sim = OSSimulation(jobs, partitions, strategy)

        # Canvas for memory partitions
        self.canvas = tk.Canvas(root, width=300, height=400, bg="white")
        self.canvas.pack(side="left", padx=10, pady=10)

        # Create a frame for the right side content
        right_frame = tk.Frame(root)
        right_frame.pack(side="right", padx=10, pady=10, fill="both", expand=True)
        
        # Create a frame for the tables (side by side)
        tables_frame = tk.Frame(right_frame)
        tables_frame.pack(side="top", fill="both", expand=True)
        
        # Text widget for Job table (left side)
        self.job_text = tk.Text(tables_frame, width=40, height=25, font=("Courier", 10))
        self.job_text.pack(side="left", fill="both", expand=True, padx=(0, 5))
        
        # Text widget for Memory table (right side)
        self.mem_text = tk.Text(tables_frame, width=40, height=25, font=("Courier", 10))
        self.mem_text.pack(side="right", fill="both", expand=True, padx=(5, 0))
        
        # Log widget for showing simulation events
        log_label = tk.Label(right_frame, text="Simulation Log:", font=("Arial", 10, "bold"))
        log_label.pack(side="top", anchor="w")
        
        self.log_text = tk.Text(right_frame, width=80, height=15, font=("Courier", 9), bg="lightgray")
        self.log_text.pack(side="top", fill="both", expand=True)

        self.partition_rects = []
        self.draw_partitions()

        # Run in background
        thread = threading.Thread(target=self.run_simulation)
        thread.start()

    def draw_partitions(self):
        y = 10
        for p in self.sim.partitions:
            rect = self.canvas.create_rectangle(50, y, 250, y+40, outline="black", fill="white")
            self.canvas.create_text(30, y+20, text=f"P{p.id}")
            self.partition_rects.append(rect)
            y += 60

    def update_ui(self):
        colors = ["lightblue", "lightgreen", "orange", "pink", "yellow", "violet"]
        # Update partitions
        for i, p in enumerate(self.sim.partitions):
            if p.status == "free":
                self.canvas.itemconfig(self.partition_rects[i], fill="white")
            else:
                color = colors[p.job.id % len(colors)]
                self.canvas.itemconfig(self.partition_rects[i], fill=color)

        # Update job + memory tables
        job_table, mem_table = self.sim.get_snapshot()
        
        # Update Job table (left side)
        job_out = f"--- Time: {self.sim.clock} | Strategy: {self.sim.strategy} ---\n\n"
        job_out += "Job Table:\nID  Size  RunTime  Status     Wait  Completion\n"
        for j in job_table:
            job_out += f"{j[0]:02}  {j[1]:04}  {j[2]:03}     {j[3]:8} {j[4]:03}   {j[5]}\n"
        self.job_text.delete("1.0", tk.END)
        self.job_text.insert(tk.END, job_out)
        
        # Update Memory table (right side)
        mem_out = f"--- Time: {self.sim.clock} | Strategy: {self.sim.strategy} ---\n\n"
        mem_out += "Memory Table:\nPID  Size  Status   Job  UseCount\n"
        for m in mem_table:
            mem_out += f"{m[0]:02}   {m[1]:04}  {m[2]:6}   {m[3]:>2}   {m[4]}\n"
        self.mem_text.delete("1.0", tk.END)
        self.mem_text.insert(tk.END, mem_out)
        
        # Update log display
        recent_logs = self.sim.get_recent_logs(15)  # Show last 15 log entries
        log_out = "\n".join(recent_logs) if recent_logs else "No events yet..."
        self.log_text.delete("1.0", tk.END)
        self.log_text.insert(tk.END, log_out)
        self.log_text.see(tk.END)  # Auto-scroll to bottom

    def display_final_statistics(self, stats):
        """Display detailed statistics calculations"""
        details = stats.get('details', {})
        
        # Create detailed statistics display
        stats_text = f"\n{'='*80}\n"
        stats_text += f"SIMULATION FINISHED - DETAILED STATISTICS\n"
        stats_text += f"{'='*80}\n\n"
        
        stats_text += f"Strategy: {stats['strategy'].upper()}\n"
        stats_text += f"Total Simulation Time: {self.sim.clock} ticks\n\n"
        
        # Throughput calculation
        stats_text += f"1. THROUGHPUT CALCULATION:\n"
        stats_text += f"   {details.get('throughput_calc', 'N/A')}\n\n"
        
        # Wait time calculation
        stats_text += f"2. AVERAGE WAIT TIME CALCULATION:\n"
        stats_text += f"   {details.get('wait_time_calc', 'N/A')}\n\n"
        
        # Utilization calculation
        stats_text += f"3. MEMORY UTILIZATION CALCULATION:\n"
        stats_text += f"   {details.get('utilization_calc', 'N/A')}\n\n"
        
        # Fragmentation calculation
        stats_text += f"4. INTERNAL FRAGMENTATION CALCULATION:\n"
        stats_text += f"   {details.get('fragmentation_calc', 'N/A')}\n"
        if 'fragmentation_details' in details:
            stats_text += f"   Detailed breakdown:\n"
            for detail in details['fragmentation_details']:
                stats_text += f"     - {detail}\n"
        stats_text += "\n"
        
        # Partition usage analysis
        stats_text += f"5. PARTITION USAGE ANALYSIS:\n"
        if 'partition_usage' in details:
            for usage in details['partition_usage']:
                stats_text += f"   - {usage}\n"
        stats_text += "\n"
        
        # Summary
        stats_text += f"SUMMARY:\n"
        stats_text += f"   Throughput: {stats['throughput']} jobs\n"
        if stats.get('too_big_jobs', 0) > 0:
            stats_text += f"   Jobs Too Big: {stats['too_big_jobs']} jobs\n"
        stats_text += f"   Avg Wait Time: {stats['avg_wait_time']:.2f} ticks\n"
        stats_text += f"   Memory Utilization: {stats['utilization %']:.1f}%\n"
        stats_text += f"   Avg Internal Fragmentation: {stats['avg_internal_frag']:.2f} KB\n"
        stats_text += f"{'='*80}\n"
        
        # Display in the job text widget
        self.job_text.insert(tk.END, stats_text)
        self.job_text.see(tk.END)  # Scroll to bottom

    def run_simulation(self):
        while not self.sim.all_done():
            self.sim.step()
            self.root.after(0, self.update_ui)
            time.sleep(1.0)
        stats = self.sim.statistics()
        self.display_final_statistics(stats)
