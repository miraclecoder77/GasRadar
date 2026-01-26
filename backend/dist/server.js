"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const engine_1 = require("./engine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const forecaster = new engine_1.GasForecaster();
const ingestor = new engine_1.GasIngestor(forecaster, process.env.RPC_URL);
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
