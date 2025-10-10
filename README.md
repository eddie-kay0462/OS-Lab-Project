# OS Memory Allocation Simulator


## Features

- **Interactive Web Interface**: Modern React-based UI with real-time visualization
- **Memory Allocation Strategies**: First-Fit and Best-Fit algorithms
- **Real-time Simulation**: Step-by-step or automatic execution
- **Visual Memory Representation**: Color-coded partitions showing allocation status
- **Comprehensive Statistics**: Detailed analysis of performance metrics

## Architecture

- **Frontend**: React.js with TypeScript
- **Backend**: Python Flask API
- **Communication**: REST API calls
- **Simulation Logic**: Python simulation engine

## Project Structure

```
OS-Lab-Project/
├── backend/
│   └── app.py              # Flask API server
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.ts         # API client
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── App.tsx        # Main application
│   └── public/
├── models.py              # Data structures (Job, Partition)
├── simulation.py          # Core simulation logic
├── requirements.txt       # Python dependencies
├── start.sh              # Startup script
└── README.md
```

## Quick Start

### Option 1: Using the startup script (Recommended)
```bash
./start.sh
```

### Option 2: Manual setup

1. **Install Python dependencies:**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the backend:**
   ```bash
   python3 backend/app.py
   ```

4. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm start
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## API Endpoints

- `POST /api/init` - Initialize simulation with jobs and partitions
- `GET /api/snapshot` - Get current simulation state
- `POST /api/step` - Execute one simulation step
- `POST /api/run-complete` - Run simulation to completion
- `POST /api/reset` - Reset simulation to initial state
- `GET /api/health` - Health check

## Usage

1. **Select Strategy**: Choose between First-Fit or Best-Fit allocation
2. **Control Simulation**:
   - **Step Forward**: Execute one simulation step
   - **Auto-Run**: Automatically execute steps with 1-second delay
   - **Run to Completion**: Execute entire simulation at once
   - **Reset**: Return to initial state
3. **Monitor Progress**: Watch real-time updates of:
   - Memory partition allocation
   - Job status changes
   - Simulation events log
4. **View Results**: Analyze comprehensive statistics when simulation completes

## Memory Allocation Strategies

### First-Fit
- Allocates job to the first available partition that fits
- Searches partitions in address order (by partition ID)
- Faster allocation, but may lead to more fragmentation

### Best-Fit
- Allocates job to the smallest available partition that fits
- Searches all free partitions and selects the tightest fit
- Better memory utilization, but slower allocation

## Technical Details

### Frontend Technologies
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP client for API communication
- **CSS3**: Responsive design with Grid and Flexbox

### Backend Technologies
- **Flask**: Lightweight Python web framework
- **Flask-CORS**: Cross-origin resource sharing support
- **Python 3**: Core simulation logic

### Key Features
- **Real-time Updates**: Live simulation state updates
- **Responsive UI**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript coverage
- **Modern UX**: Intuitive controls and visual feedback

## Educational Value

This simulator demonstrates:
- **Memory Management Concepts**: Partition allocation, fragmentation
- **Algorithm Comparison**: Performance differences between strategies
- **System Performance**: Throughput, wait times, utilization metrics

## Development

### Adding New Features
1. **Backend**: Modify `backend/app.py` for new API endpoints
2. **Frontend**: Add components in `frontend/src/components/`
3. **Types**: Update `frontend/src/types.ts` for new data structures

### Testing
- **Backend**: Test API endpoints with tools like Postman
- **Frontend**: Use React testing utilities
- **Integration**: Test full stack functionality


## License

This project is for educational purposes as part of an Operating Systems course.
