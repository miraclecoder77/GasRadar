import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sun,
  Moon,
  Zap,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { GasChart } from './components/GasChart';
import { TransactionCalculator } from './components/TransactionCalculator';

const API_BASE = '/api';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [gasStatus, setGasStatus] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, forecastRes] = await Promise.all([
          axios.get(`${API_BASE}/gas/status`),
          axios.get(`${API_BASE}/gas/forecast`)
        ]);
        setGasStatus(statusRes.data);
        setForecasts(forecastRes.data);
      } catch (err) {
        console.error('API Error', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const currentFee = gasStatus?.current?.baseFee?.toFixed(2) || '...';
  const ethPrice = gasStatus?.current?.ethPrice || 2500;

  const getUsdEstimate = (gwei: string, gasLimit: number = 21000) => {
    if (gwei === '...') return '...';
    const eth = (parseFloat(gwei) * gasLimit) / 1e9;
    return (eth * ethPrice).toFixed(2);
  };

  const networks = [
    { id: 'ethereum', icon: <Layers className="w-5 h-5" />, label: 'Ethereum' },
    { id: 'polygon', icon: <Activity className="w-5 h-5" />, label: 'Polygon', disabled: true },
    { id: 'optimism', icon: <Zap className="w-5 h-5" />, label: 'Optimism', disabled: true },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-m3-surface text-m3-on-surface transition-colors duration-300`}>
      {/* Navigation Rail (Desktop) */}
      <aside className="nav-rail">
        <div className="bg-m3-primary-container text-m3-on-primary-container p-3 rounded-2xl mb-8">
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-6">
          {networks.map((net) => (
            <button
              key={net.id}
              onClick={() => !net.disabled && setSelectedNetwork(net.id)}
              className={`p-3 rounded-2xl transition-all ${selectedNetwork === net.id
                ? 'bg-m3-secondary text-m3-on-secondary'
                : 'text-m3-on-surface-variant hover:bg-m3-surface-variant'
                } ${net.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {net.icon}
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <button className="p-3 text-m3-on-surface-variant hover:bg-m3-surface-variant rounded-2xl">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-20 pb-24 md:pb-0">
        <header className="px-6 h-20 md:h-24 flex items-center justify-between sticky top-0 z-40 bg-m3-surface/80 backdrop-blur-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">GasRadar</h1>
            <p className="text-xs md:text-sm text-m3-on-surface-variant font-medium uppercase tracking-wider">
              {selectedNetwork} network
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-m3-surface-variant text-m3-on-surface-variant rounded-full hover:bg-m3-outline/20 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          {/* Top Ad Slot */}
          <div className="mb-10 md:mb-16">
            <div className="native-ad-label md:text-xs">Sponsored</div>
            <div className="native-ad-container p-6 md:p-8 flex-col md:flex-row text-center md:text-left gap-4 md:gap-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-m3-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="text-m3-primary w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-m3-on-surface text-lg md:text-xl">Secure your wallet with GasRadar Pro</h4>
                <p className="text-sm md:text-base text-m3-on-surface-variant">Get instant alerts for low gas prices and network spikes.</p>
              </div>
              <button className="md:ml-auto px-6 py-2 md:px-8 md:py-3 bg-m3-primary text-m3-on-primary rounded-full text-sm md:text-base font-medium">
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-10 md:mb-16">
            {/* Real-time Cards */}
            <div className="m3-card-elevated">
              <div className="flex justify-between items-start mb-6 md:mb-10">
                <div className="bg-m3-success text-m3-on-success px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase transition-colors">
                  Eco
                </div>
                <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-m3-outline" />
              </div>
              <div className="text-4xl md:text-5xl 2xl:text-6xl font-bold mb-1 tracking-tight">
                {(parseFloat(currentFee) * 0.9).toFixed(1)}
              </div>
              <div className="text-sm md:text-base text-m3-on-surface-variant flex flex-col">
                <span>Gwei • ~20 min</span>
                <span className="text-m3-success font-bold text-xs mt-1">~${getUsdEstimate((parseFloat(currentFee) * 0.9).toString())}</span>
              </div>
            </div>

            <div className="m3-card-elevated ring-2 ring-m3-primary ring-offset-4 ring-offset-m3-surface md:scale-105">
              <div className="flex justify-between items-start mb-6 md:mb-10">
                <div className="bg-m3-primary-container text-m3-on-primary-container px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase">
                  Market
                </div>
                <Clock className="w-5 h-5 md:w-7 md:h-7 text-m3-primary" />
              </div>
              <div className="text-4xl md:text-5xl 2xl:text-6xl font-bold mb-1 tracking-tight text-m3-primary">
                {currentFee}
              </div>
              <div className="text-sm md:text-base text-m3-on-surface-variant flex flex-col">
                <span>Gwei • ~3 min</span>
                <span className="text-m3-primary font-bold text-xs mt-1">~${getUsdEstimate(currentFee)}</span>
              </div>
            </div>

            <div className="m3-card-elevated">
              <div className="flex justify-between items-start mb-6 md:mb-10">
                <div className="bg-m3-error text-m3-on-error px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase transition-colors">
                  Rapid
                </div>
                <Zap className="w-5 h-5 md:w-7 md:h-7 text-m3-outline" />
              </div>
              <div className="text-4xl md:text-5xl 2xl:text-6xl font-bold mb-1 tracking-tight">
                {(parseFloat(currentFee) * 1.2).toFixed(1)}
              </div>
              <div className="text-sm md:text-base text-m3-on-surface-variant flex flex-col">
                <span>Gwei • ~15 sec</span>
                <span className="text-m3-error font-bold text-xs mt-1">~${getUsdEstimate((parseFloat(currentFee) * 1.2).toString())}</span>
              </div>
            </div>
          </div>

          <div className="m3-card-filled mb-10 md:mb-16 overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl 2xl:text-4xl font-bold tracking-tight mb-1">Forecast Analysis</h2>
                <p className="text-sm md:text-base text-m3-on-surface-variant">Advanced smoothing models for gas price prediction</p>
              </div>
              <div className="flex gap-2 md:gap-4">
                {['15m', '30m', '60m'].map((limit) => (
                  <div key={limit} className="bg-m3-surface/50 backdrop-blur px-4 py-2 md:px-6 md:py-3 rounded-2xl min-w-[80px] md:min-w-[100px] text-center">
                    <div className="text-[10px] md:text-xs text-m3-on-surface-variant font-bold uppercase mb-1">{limit}</div>
                    <div className="text-lg md:text-xl font-bold text-m3-primary">
                      {forecasts ? forecasts[limit].toFixed(1) : '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {gasStatus && forecasts && (
              <>
                <GasChart
                  data={gasStatus.history}
                  forecasts={forecasts}
                  isDark={isDark}
                />
                <TransactionCalculator
                  baseFeeGwei={parseFloat(currentFee)}
                  ethPrice={ethPrice}
                  isDark={isDark}
                />
              </>
            )}
          </div>

          {/* Inline Native Ad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="m3-card-outlined flex items-center gap-4 md:gap-6 p-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-m3-surface-variant rounded-2xl flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="native-ad-label md:text-xs">Sponsored</div>
                <div className="h-4 md:h-5 bg-m3-surface-variant rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 md:h-4 bg-m3-surface-variant rounded w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="m3-card-outlined bg-m3-primary text-m3-on-primary border-none p-6 flex flex-col justify-center">
              <h4 className="font-bold mb-2 text-lg md:text-xl">GasRadar API</h4>
              <p className="text-sm md:text-base opacity-90 mb-4">Powerful gas forecasting for your dApp or trading bot.</p>
              <button className="text-sm md:text-base font-bold flex items-center gap-1 hover:gap-2 transition-all">
                GET STARTED <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </main>

        <footer className="py-12 md:py-16 text-center text-sm md:text-base text-m3-on-surface-variant opacity-60">
          <p>&copy; 2026 GasRadar</p>
          <p className="mt-1">Ethereum</p>
        </footer>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        {networks.map((net) => (
          <button
            key={net.id}
            onClick={() => !net.disabled && setSelectedNetwork(net.id)}
            className={`flex flex-col items-center gap-1 transition-all ${selectedNetwork === net.id ? 'text-m3-primary' : 'text-m3-on-surface-variant opacity-60'
              } ${net.disabled ? 'grayscale cursor-not-allowed' : ''}`}
          >
            {net.icon}
            <span className="text-[10px] font-bold uppercase">{net.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

