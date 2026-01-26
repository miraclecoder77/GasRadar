import React from 'react';
import { Send, RefreshCw, PlusCircle, Info } from 'lucide-react';

interface CalculatorProps {
    baseFeeGwei: number;
    ethPrice: number;
    isDark: boolean;
}

export const TransactionCalculator: React.FC<CalculatorProps> = ({ baseFeeGwei, ethPrice, isDark }) => {
    const transactions = [
        { id: 'send', label: 'Simple Send', gas: 21000, icon: <Send className="w-5 h-5" /> },
        { id: 'swap', label: 'Uniswap Swap', gas: 150000, icon: <RefreshCw className="w-5 h-5" /> },
        { id: 'mint', label: 'NFT Mint', gas: 80000, icon: <PlusCircle className="w-5 h-5" /> },
    ];

    const calculateCost = (gasLimit: number) => {
        const ethCost = (gasLimit * baseFeeGwei) / 1e9;
        const usdCost = ethCost * ethPrice;
        return {
            eth: ethCost.toFixed(5),
            usd: usdCost.toFixed(2)
        };
    };

    const cardBg = isDark ? 'bg-m3-surface-variant/30' : 'bg-m3-surface-container-low';
    const textColor = isDark ? 'text-m3-on-surface' : 'text-m3-on-surface-variant';

    return (
        <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-bold">Transaction Cost Estimator</h3>
                <div className="group relative">
                    <Info className="w-4 h-4 text-m3-outline cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-m3-surface-container-high text-m3-on-surface text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-m3-outline/20 z-50">
                        <strong>Analogy:</strong> If Ethereum is a highway, <strong>Gas</strong> is the fuel. A motorcycle (Send) uses less fuel than a bus (Swap). <strong>Gwei</strong> is the price per gallon.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {transactions.map((tx) => {
                    const cost = calculateCost(tx.gas);
                    return (
                        <div key={tx.id} className={`${cardBg} p-5 rounded-3xl border border-m3-outline/10 transition-transform hover:scale-[1.02]`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-m3-primary/10 text-m3-primary rounded-xl">
                                    {tx.icon}
                                </div>
                                <span className="font-semibold text-sm">{tx.label}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold">${cost.usd}</span>
                                <span className={`text-xs ${textColor} opacity-70`}>{cost.eth} ETH</span>
                            </div>
                            <div className="mt-3 text-[10px] uppercase font-bold text-m3-outline tracking-wider">
                                {tx.gas.toLocaleString()} Gas Units
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
