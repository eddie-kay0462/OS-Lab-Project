class Job:
    def __init__(self, jid, size, run_time):
        self.id = jid
        self.size = size
        self.run_time = run_time
        self.remaining = run_time
        self.wait_time = 0
        self.completion = None
        self.status = "new"
        self.assigned_partition = None  # Track which partition this job was assigned to

class Partition:
    def __init__(self, pid, size):
        self.id = pid
        self.size = size
        self.status = "free"
        self.use_count = 0 #track how many times this partition was used
        self.job = None
