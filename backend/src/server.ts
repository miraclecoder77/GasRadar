import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GasForecaster, GasIngestor } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize forecaster and ingestor
const forecaster = new GasForecaster();
const ingestor = new GasIngestor(forecaster, process.env.RPC_URL);

// In a serverless environment, we need to ensure data is seeded if empty
// But we can't rely on a long-running process. 
// We'll trigger a seed if the history is empty on request or during init.
let isInitialized = false;
const initialize = async () => {
    if (!isInitialized) {
        await ingestor.start();
        isInitialized = true;
    }
};

app.get('/api/gas/status', async (req, res) => {
    await initialize();
    const history = forecaster.getHistory();
    const current = history[history.length - 1];

    res.json({
        current,
        history: history.slice(-100)
    });
});

app.get('/api/gas/forecast', async (req, res) => {
    await initialize();
    res.json({
        '15m': forecaster.predict(15),
        '30m': forecaster.predict(30),
        '60m': forecaster.predict(60),
        timestamp: Date.now()
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`GasRadar Backend running at http://localhost:${port}`);
    });
}

export default app;
