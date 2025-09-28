import tkinter as tk
from gui import MemorySimApp

if __name__ == "__main__":
    partitions = [9500, 7000, 4500, 8500, 3000, 9000, 1000, 5500, 1500, 500]

    jobs = [
        (1, 5760, 5),
        (2, 4190, 4),
        (3, 3290, 8),
        (4, 2030, 2),
        (5, 2550, 2),
        (6, 6990, 6),
        (7, 8940, 8),
        (8, 740, 10),
        (9, 3930, 7),
        (10, 6890, 6),
        (11, 6580, 5),
        (12, 3820, 8),
        (13, 9140, 9),
        (14, 420, 10),
        (15, 220, 10),
        (16, 7540, 7),
        (17, 3210, 3),
        (18, 1380, 1),
        (19, 9850, 9),
        (20, 3610, 3),
        (21, 7540, 7),
        (22, 2710, 2),
        (23, 8390, 8),
        (24, 5950, 5),
        (25, 760, 10),
    ]

    root = tk.Tk()
    root.title("OS Memory Allocation Simulator")
    app = MemorySimApp(root, jobs, partitions, strategy="first-fit")  # try "first-fit" too
    root.mainloop()
