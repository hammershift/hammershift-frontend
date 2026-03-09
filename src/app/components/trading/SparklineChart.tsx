'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: { day: number; price: number }[];
  positive: boolean; // true = green, false = red
}

export default function SparklineChart({ data, positive }: Props) {
  const color = positive ? '#10B981' : '#EF4444';

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
