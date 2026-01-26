import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GasForecaster, GasIngestor } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const forecaster = new GasForecaster();
const ingestor = new GasIngestor(forecaster, process.env.RPC_URL);

// Start ingestion
ingestor.start().then(() => {
    console.log('Gas Radar Engine started');
});

app.get('/api/gas/status', (req, res) => {
    const history = forecaster.getHistory();
    const current = history[history.length - 1];

    res.json({
        current,
        history: history.slice(-100) // Return last 100 mins
    });
});

app.get('/api/gas/forecast', (req, res) => {
    res.json({
        '15m': forecaster.predict(15),
        '30m': forecaster.predict(30),
        '60m': forecaster.predict(60),
        timestamp: Date.now()
    });
});

app.listen(port, () => {
    console.log(`GasRadar Backend running at http://localhost:${port}`);
});
