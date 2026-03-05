'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PricePoint {
  timestamp: Date;
  yesPrice: number;
  noPrice: number;
  volume?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  outcome?: 'YES' | 'NO' | 'BOTH';
  className?: string;
}

export function PriceChart({ data, outcome = 'BOTH', className = '' }: PriceChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      YES: point.yesPrice,
      NO: point.noPrice,
      volume: point.volume || 0,
    }));
  }, [data]);

  const showYes = outcome === 'YES' || outcome === 'BOTH';
  const showNo = outcome === 'NO' || outcome === 'BOTH';

  if (data.length === 0) {
    return (
      <div className={`flex h-[400px] items-center justify-center rounded-lg border border-gray-700 bg-trading-bg-card ${className}`}>
        <p className="text-gray-500">No price data available</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-700 bg-trading-bg-card p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Price History</h3>
        <div className="flex items-center gap-4 text-xs">
          {showYes && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-trading-yes" />
              <span className="text-gray-400">YES</span>
            </div>
          )}
          {showNo && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-trading-no" />
              <span className="text-gray-400">NO</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            domain={[0, 1]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [`$${value.toFixed(3)}`, '']}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          {showYes && (
            <Line
              type="monotone"
              dataKey="YES"
              stroke="#14B8A6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          {showNo && (
            <Line
              type="monotone"
              dataKey="NO"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
