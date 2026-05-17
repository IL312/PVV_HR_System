// src/components/charts/PieChartComponent.tsx
import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import './ChartComponent.css';

interface PieChartProps {
  data: ChartDataPoint[];
  title: string;
  dataKey: string;
  nameKey: string;
}

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8'];

const PieChartComponent: React.FC<PieChartProps> = ({ data, title, dataKey, nameKey }) => {
  // Фильтруем нулевые значения, чтобы Recharts не падал
  const validData = data.filter(row => row[dataKey] && Number(row[dataKey]) > 0);

  if (validData.length === 0) {
    return <div className="no-data">Нет данных для построения диаграммы</div>;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {validData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={(entry as any).color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;