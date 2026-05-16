import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { ChartDataPoint } from '../../types';

interface BarChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey: string;
  title: string;
  secondaryDataKey?: string;
  colors?: string[];
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  secondaryDataKey,
  colors = ['#007bff', '#28a745']
}) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey={nameKey} 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any) => [
              typeof value === 'number' ? value.toLocaleString('ru-RU') : value,
              dataKey
            ]}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Bar 
            dataKey={dataKey} 
            name={dataKey} 
            fill={colors[0]} 
            radius={[4, 4, 0, 0]}
          />
          {secondaryDataKey && (
            <Bar 
              dataKey={secondaryDataKey} 
              name={secondaryDataKey} 
              fill={colors[1]} 
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;