import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { ChartDataPoint } from '../../types';


interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  dataKey: string;
  nameKey: string;
}

const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  title,
  dataKey,
  nameKey
}) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 

          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#007bff" 
            strokeWidth={2}
            dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;