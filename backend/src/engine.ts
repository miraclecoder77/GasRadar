import { ethers, JsonRpcProvider, WebSocketProvider } from 'ethers';
import cron from 'node-cron';

interface GasDataPoint {
    timestamp: number;
    baseFee: number;
    utilization: number;
    ethPrice?: number;
}

export class GasForecaster {
    private history: GasDataPoint[] = [];
    private alpha = 0.3; // Smoothing for level
    private beta = 0.1;  // Smoothing for trend
    private gamma = 0.2; // Smoothing for seasonality
    private period = 60; // Period for seasonality (60 data points, e.g., 60 minutes)

    constructor() { }

    public addDataPoint(point: GasDataPoint) {
        this.history.push(point);
        if (this.history.length > 2000) {
            this.history.shift();
        }
    }

    public predict(minutesAhead: number): number {
        if (this.history.length < 2) return this.history[this.history.length - 1]?.baseFee || 0;

        // Implementation of Triple Exponential Smoothing (Holt-Winters)
        // For simplicity in this demo, we'll use a damped trend model if data is limited
        // and full HW if we have > period points.

        let level = this.history[0].baseFee;
        let trend = this.history[1].baseFee - this.history[0].baseFee;
        let seasonal = new Array(this.period).fill(1);

        for (let i = 1; i < this.history.length; i++) {
            const obs = this.history[i].baseFee;
            const lastLevel = level;

            // Update Level
            level = this.alpha * (obs / seasonal[i % this.period]) + (1 - this.alpha) * (level + trend);
            // Update Trend
            trend = this.beta * (level - lastLevel) + (1 - this.beta) * trend;
            // Update Seasonal
            seasonal[i % this.period] = this.gamma * (obs / level) + (1 - this.gamma) * seasonal[i % this.period];
        }

        // Forecast: F(t+k) = (L + k*T) * S(t-period+k)
        const k = minutesAhead;
        const forecast = (level + k * trend) * seasonal[(this.history.length + k) % this.period];

        return Math.max(0, forecast);
    }

    public getHistory() {
        return this.history;
    }
}

export class GasIngestor {
    private provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | null = null;
    private forecaster: GasForecaster;
    private isMock: boolean = true;
    private currentEthPrice: number = 2500;

    constructor(forecaster: GasForecaster, rpcUrl?: string) {
        this.forecaster = forecaster;
        if (rpcUrl) {
            this.provider = rpcUrl.startsWith('wss://')
                ? new ethers.WebSocketProvider(rpcUrl)
                : new ethers.JsonRpcProvider(rpcUrl);
            this.isMock = false;
        }
    }

    public async start() {
        // In a real app, we'd fetch the last 100 blocks to seed the forecaster
        if (!this.isMock && this.provider) {
            await this.seedHistoricalData();
        } else {
            console.log('Starting in MOCK mode...');
            await this.seedMockData();
        }

        // Every minute, fetch new data or generate mock data
        cron.schedule('* * * * *', async () => {
            if (this.isMock) {
                this.generateMockPoint();
            } else {
                await this.syncNewBlock();
            }
        });
    }

    private async seedHistoricalData() {
        try {
            // eth_feeHistory: (blockCount, newestBlock, rewardPercentiles)
            // Latest 1024 blocks is max for many providers
            const history = await this.provider!.send('eth_feeHistory', [100, 'latest', []]);
            const baseFees = history.baseFeePerGas.map((f: string) => parseInt(f, 16) / 1e9);
            const utilization = history.gasUsedRatio;

            await this.fetchEthPrice();
            baseFees.forEach((fee: number, i: number) => {
                this.forecaster.addDataPoint({
                    timestamp: Date.now() - (100 - i) * 12000, // Approx 12s per block
                    baseFee: fee,
                    utilization: utilization[i] || 0.5,
                    ethPrice: this.currentEthPrice
                });
            });
        } catch (e) {
            console.error('Failed to seed historical data, falling back to mock.', e);
            this.isMock = true;
            await this.seedMockData();
        }
    }

    private async syncNewBlock() {
        try {
            await this.fetchEthPrice();
            const history = await this.provider!.send('eth_feeHistory', [1, 'latest', []]);
            this.forecaster.addDataPoint({
                timestamp: Date.now(),
                baseFee: parseInt(history.baseFeePerGas[1], 16) / 1e9,
                utilization: history.gasUsedRatio[0],
                ethPrice: this.currentEthPrice
            });
        } catch (e) {
            console.error('Failed to sync new block', e);
        }
    }

    private async fetchEthPrice() {
        try {
            // Using a simple public API for ETH price (this one doesn't require an API key for low freq)
            const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
            const data = await response.json() as { price: string };
            this.currentEthPrice = parseFloat(data.price);
        } catch (e) {
            console.error('Failed to fetch ETH price', e);
        }
    }

    private seedMockData() {
        let currentFee = 20;
        for (let i = 0; i < 200; i++) {
            currentFee += (Math.random() - 0.5) * 2;
            this.forecaster.addDataPoint({
                timestamp: Date.now() - (200 - i) * 60000,
                baseFee: Math.max(1, currentFee),
                utilization: Math.random(),
                ethPrice: 2500 + (Math.random() - 0.5) * 10
            });
        }
    }

    private async generateMockPoint() {
        await this.fetchEthPrice();
        const lastPoint = this.forecaster.getHistory()[this.forecaster.getHistory().length - 1];
        let newFee = lastPoint.baseFee + (Math.random() - 0.48) * 1.5; // Slight upward bias for spikes

        // Simulate a random spike every now and then
        if (Math.random() > 0.95) {
            newFee += Math.random() * 10;
        }

        this.forecaster.addDataPoint({
            timestamp: Date.now(),
            baseFee: Math.max(1, newFee),
            utilization: Math.random(),
            ethPrice: this.currentEthPrice
        });
    }
}
