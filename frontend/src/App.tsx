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
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GasChart } from './components/GasChart';
import { TransactionCalculator } from './components/TransactionCalculator';
import { AdSlot } from './components/AdSlot';

const API_BASE = '/api';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [gasStatus, setGasStatus] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const faqs = [
    {
      q: "What is Ethereum Gas and Gwei?",
      a: "Gas refers to the unit that measures the amount of computational effort required to execute specific operations on the Ethereum network. Since each Ethereum transaction requires computational resources to execute, each transaction requires a fee. Gwei is a denomination of the cryptocurrency ether (ETH) used in the Ethereum network of which there are 1,000,000,000 in 1 ETH."
    },
    {
      q: "How does the GasRadar forecast work?",
      a: "GasRadar uses advanced statistical smoothing models to analyze historical gas price trends. By tracking the base fee churn and network congestion, we provide 15, 30, and 60-minute estimates to help users time their transactions during low-fee lulls."
    },
    {
      q: "How can I lower my Ethereum gas fees?",
      a: "To save on ETH transaction costs, you should monitor the live Gwei prices and use a gas tracker like GasRadar. Timing your transactions during off-peak hours (often weekends or late nights UTC) can reduce fees by up to 50%."
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-m3-surface text-m3-on-surface transition-colors duration-300`}>
      {/* Navigation Rail (Desktop) */}
      <aside className="nav-rail">
        <div className="bg-m3-primary-container text-m3-on-primary-container p-3 rounded-2xl mb-8">
          <Activity className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          {networks.map((net) => (
            <button
              key={net.id}
              onClick={() => !net.disabled && setSelectedNetwork(net.id)}
              className={`p-3 rounded-2xl transition-all ${selectedNetwork === net.id
                ? 'bg-m3-secondary text-m3-on-secondary'
                : 'text-m3-on-surface-variant hover:bg-m3-surface-variant'
                } ${net.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              aria-label={`Select ${net.label} network`}
            >
              {net.icon}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <button className="p-3 text-m3-on-surface-variant hover:bg-m3-surface-variant rounded-2xl" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-20 pb-24 md:pb-0">
        <header className="px-6 h-20 md:h-24 flex items-center justify-between sticky top-0 z-40 bg-m3-surface/80 backdrop-blur-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">GasRadar</h1>
            <p className="text-xs md:text-sm text-m3-on-surface-variant font-medium uppercase tracking-wider">
              {selectedNetwork} Network Live Gas Tracker
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-m3-surface-variant text-m3-on-surface-variant rounded-full hover:bg-m3-outline/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          {/* Top Leaderboard Ad Slot */}
          <AdSlot id="top-banner" type="display" />

          {/* Value Proposition Header */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Ethereum Gas Price Oracle</h2>
            <p className="text-m3-on-surface-variant max-w-2xl">
              Track real-time Ethereum gas fees (Gwei) and predictive forecasts. Optimize your DeFi transactions and NFT mints with precision.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 md:mb-16">
            {/* Real-time Cards */}
            <article className="m3-card-elevated">
              <div className="flex justify-between items-start mb-6 md:mb-10">
                <div className="bg-m3-success text-m3-on-success px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase">
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
            </article>

            <article className="m3-card-elevated">
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
            </article>

            <article className="m3-card-elevated">
              <div className="flex justify-between items-start mb-6 md:mb-10">
                <div className="bg-m3-error text-m3-on-error px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase">
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
            </article>
          </div>

          {gasStatus && (
            <section className="mb-10 md:mb-16">
              <TransactionCalculator
                baseFeeGwei={parseFloat(currentFee)}
                ethPrice={ethPrice}
                isDark={isDark}
              />
            </section>
          )}

          <section className="m3-card-filled mb-10 md:mb-16 overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl 2xl:text-4xl font-bold tracking-tight mb-1">Live Gwei Analysis & Forecast</h2>
                <p className="text-sm md:text-base text-m3-on-surface-variant">Advanced predictive models for Ethereum gas prices</p>
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
              <GasChart
                data={gasStatus.history}
                forecasts={forecasts}
                isDark={isDark}
              />
            )}
          </section>

          {/* Native Ad Slot */}
          <AdSlot id="native-middle" type="native" />

          {/* SEO Content / FAQ Section */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold mb-8">Understanding Ethereum Gas Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-m3-on-surface-variant leading-relaxed">
                  Navigating the world of decentralized finance requires a deep understanding of <strong>ETH gas fees</strong>.
                  Whether you are swapping on Uniswap, minting an NFT, or bridging assets to Layer 2,
                  the cost of your transaction depends on network congestion and the current <strong>Gwei price</strong>.
                </p>
                <p className="text-m3-on-surface-variant leading-relaxed">
                  Our <strong>Ethereum Gas Tracker</strong> doesn't just show you the present state; it looks into the future.
                  By utilizing custom forecast algorithms, GasRadar helps you save significant amounts of ETH
                  by identifying the optimal time to confirm your transaction.
                </p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="m3-card-outlined p-0 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left p-6 flex justify-between items-center hover:bg-m3-surface-variant/10 transition-colors"
                    >
                      <span className="font-bold pr-4">{faq.q}</span>
                      {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {openFaq === index && (
                      <div className="p-6 pt-0 text-m3-on-surface-variant text-sm border-t border-m3-outline/20">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Call to Action / Ad */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <AdSlot id="bottom-infeed" type="in-feed" />
            <div className="m3-card-outlined bg-m3-primary text-m3-on-primary border-none p-8 flex flex-col justify-center">
              <h4 className="font-bold mb-2 text-xl md:text-2xl">GasRadar Enterprise API</h4>
              <p className="opacity-90 mb-6">Integrate our powerful gas forecasting engine into your custom dApp or high-frequency trading bot.</p>
              <button className="bg-m3-on-primary text-m3-primary px-8 py-3 rounded-full font-bold self-start hover:opacity-90 transition-all flex items-center gap-2">
                VIEW DOCUMENTATION <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </section>
        </main>

        <footer className="py-12 md:py-24 bg-m3-surface-variant/10 mt-16">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-2xl font-bold mb-4">GasRadar</div>
              <p className="text-sm text-m3-on-surface-variant opacity-70 leading-relaxed">
                The world's most advanced Ethereum gas price oracle and forecasting suite.
                Built for the next generation of Web3 users.
              </p>
            </div>
            <div>
              <div className="font-bold mb-4 uppercase text-xs tracking-widest text-m3-primary">Resources</div>
              <ul className="space-y-2 text-sm text-m3-on-surface-variant">
                <li><a href="#" className="hover:text-m3-primary transition-colors">Gas Fee Calculator</a></li>
                <li><a href="#" className="hover:text-m3-primary transition-colors">Historical Data</a></li>
                <li><a href="#" className="hover:text-m3-primary transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-m3-primary transition-colors">Developer Blog</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4 uppercase text-xs tracking-widest text-m3-primary">Network Status</div>
              <div className="flex items-center gap-2 text-sm text-m3-on-surface-variant mb-4">
                <div className="w-2 h-2 rounded-full bg-m3-success animate-pulse" />
                <span>Ethereum Mainnet: Operational</span>
              </div>
              <p className="text-xs text-m3-on-surface-variant opacity-50">&copy; 2026 GasRadar Analysis. All rights reserved.</p>
            </div>
          </div>
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
            aria-label={`Select ${net.label} network`}
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

