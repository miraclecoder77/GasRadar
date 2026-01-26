import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ChartProps {
    data: any[];
    forecasts: { '15m': number; '30m': number; '60m': number };
    isDark: boolean;
}

export const GasChart: React.FC<ChartProps> = ({ data, forecasts, isDark }) => {
    const chartData = [...data];
    const lastTime = data.length > 0 ? data[data.length - 1].timestamp : Date.now();

    // Add forecast points
    chartData.push({ timestamp: lastTime + 15 * 60000, baseFee: forecasts['15m'], isForecast: true });
    chartData.push({ timestamp: lastTime + 30 * 60000, baseFee: forecasts['30m'], isForecast: true });
    chartData.push({ timestamp: lastTime + 60 * 60000, baseFee: forecasts['60m'], isForecast: true });

    const labelColor = isDark ? '#c4c6d0' : '#44474f'; // M3 On Surface Variant
    const gridColor = isDark ? '#44474f20' : '#e1e2ec80'; // M3 Surface Variant with alpha
    const primaryColor = isDark ? '#adc6ff' : '#005ac1'; // M3 Primary

    return (
        <div className="h-[400px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="timestamp"
                        hide
                    />
                    <YAxis
                        tick={{ fill: labelColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        unit=" G"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1b1b1f' : '#fefbff',
                            border: `1px solid ${isDark ? '#44474f' : '#e1e2ec'}`,
                            borderRadius: '12px',
                            color: isDark ? '#e3e2e6' : '#1b1b1f',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: primaryColor }}
                        labelFormatter={() => ''}
                    />
                    {/* History Line */}
                    <Line
                        type="monotone"
                        dataKey="baseFee"
                        stroke={primaryColor}
                        strokeWidth={3}
                        dot={false}
                        connectNulls
                        data={data}
                    />
                    {/* Forecast Line (Dashed) */}
                    <Line
                        type="monotone"
                        dataKey="baseFee"
                        stroke={primaryColor}
                        strokeWidth={3}
                        strokeDasharray="8 8"
                        dot={{ r: 6, fill: primaryColor, strokeWidth: 2, stroke: isDark ? '#1b1b1f' : '#ffffff' }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
