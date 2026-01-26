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
// Initialize forecaster and ingestor
const forecaster = new engine_1.GasForecaster();
const ingestor = new engine_1.GasIngestor(forecaster, process.env.RPC_URL);
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
exports.default = app;
