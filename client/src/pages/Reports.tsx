import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarChartComponent from '../components/charts/BarChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import LineChartComponent from '../components/charts/LineChartComponent';
import ReportFilters from '../components/ReportFilters';
import type { ReportRow, ChartDataPoint } from '../types';

// Конфигурация отчетов. Теперь мы связываем таблицу и график в одном элементе.
interface ReportConfig {
  id: string;
  label: string;
  tableEndpoint: string;
  chartEndpoint?: string;   // Если есть график
  chartType?: 'bar' | 'pie' | 'line';
  chartTitle?: string;      // Заголовок для графика
}

const REPORTS_CONFIG: ReportConfig[] = [
  {
    id: 'employee-count',
    label: 'Сотрудники по отделам',
    tableEndpoint: '/employee-count',
    chartEndpoint: '/chart/employees-by-dept',
    chartType: 'pie',
    chartTitle: 'Распределение сотрудников по отделам'
  },
  {
    id: 'payroll',
    label: 'Фонд заработной платы',
    tableEndpoint: '/payroll',
    chartEndpoint: '/chart/payroll-by-dept',
    chartType: 'bar',
    chartTitle: 'Фонд ЗП по отделам'
  },
  {
    id: 'turnover',
    label: 'Текучесть кадров',
    tableEndpoint: '/turnover',
    chartEndpoint: '/chart/turnover-pie',
    chartType: 'pie',
    chartTitle: 'Статусы сотрудников'
  },
  {
    id: 'vacations',
    label: 'График отпусков',
    tableEndpoint: '/vacations',
    chartEndpoint: '/chart/vacations-by-month',
    chartType: 'line',
    chartTitle: 'Динамика отпусков по месяцам'
  },
  {
    id: 'career',
    label: 'Карьерный рост',
    tableEndpoint: '/career-growth',
    chartEndpoint: '/chart/career-types',
    chartType: 'pie',
    chartTitle: 'Типы карьерных изменений'
  },
  {
    id: 'absences',
    label: 'Отсутствующие сотрудники',
    tableEndpoint: '/absences'
  }
];

const Reports: React.FC = () => {
  const [activeReportId, setActiveReportId] = useState<string>('employee-count');

  const [filters, setFilters] = useState({
    department_id: '',
    start_date: '',
    end_date: ''
  });
  
  const [tableData, setTableData] = useState<ReportRow[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentConfig = REPORTS_CONFIG.find(r => r.id === activeReportId);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentConfig) return;

      setLoading(true);
      try {
        // Формируем Query String для запросов
        const queryParams = new URLSearchParams();
        if (filters.department_id) queryParams.append('department_id', filters.department_id);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        
        const queryString = queryParams.toString();
        const suffix = queryString ? '?' + queryString : '';

        // 1. Данные таблицы
        const tableUrl = `/api/reports${currentConfig.tableEndpoint}${suffix}`;
        const tableRes = await axios.get<ReportRow[]>(tableUrl);
        setTableData(tableRes.data);

        // 2. Данные графика
        if (currentConfig.chartEndpoint) {
          const chartUrl = `/api/reports${currentConfig.chartEndpoint}${suffix}`;
          const chartRes = await axios.get<ChartDataPoint[]>(chartUrl);
          
          const sanitizedChartData = chartRes.data.map(item => ({
            ...item,
            value: Number(item.value)
          }));
          setChartData(sanitizedChartData);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentConfig, filters]);

  const formatHeader = (key: string): string => 
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const renderTable = () => {
    if (tableData.length === 0) return <p className="no-data">Нет данных</p>;
    const headers = Object.keys(tableData[0]);

    return (
      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>{headers.map(h => <th key={h}>{formatHeader(h)}</th>)}</tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {headers.map(h => (
                  <td key={h}>
                    {row[h] !== null && row[h] !== undefined 
                      ? (h.includes('date') ? new Date(String(row[h])).toLocaleDateString('ru-RU') : String(row[h])) 
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderChart = () => {
    if (!currentConfig?.chartType) return null;
    if (chartData.length === 0 && !loading) 
      return <p className="no-data">Нет данных для графика по выбранным фильтрам</p>;

    switch (currentConfig.chartType) {
      case 'bar':
        return (
          <BarChartComponent 
            data={chartData} 
            dataKey="value" 
            nameKey="name" 
            title={currentConfig.chartTitle || ''} 
            secondaryDataKey={chartData[0]?.active ? 'active' : undefined} 
          />
        );
      case 'pie':
        return (
          <PieChartComponent 
            data={chartData} 
            dataKey="value" 
            nameKey="name" 
            title={currentConfig.chartTitle || ''} 
          />
        );
      case 'line':
        return (
          <LineChartComponent 
            data={chartData} 
            dataKey="value" 
            nameKey="month" // Для линейного графика X-axis
            title={currentConfig.chartTitle || ''} 
          />
        );
      default: return null;
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Отчеты и аналитика</h1>
      </div>

      <div className="report-tabs">
        {REPORTS_CONFIG.map(report => (
          <button
            key={report.id}
            className={`tab-btn ${activeReportId === report.id ? 'active' : ''}`}
            onClick={() => setActiveReportId(report.id)}
          >
            {report.label}
          </button>
        ))}
      </div>

      <div className="report-filters-wrapper">
         <ReportFilters filters={filters} setFilters={setFilters} />
      </div>
      
      <div className="report-content">
        {loading ? (
          <div className="loading-state">Загрузка...</div>
        ) : (
          <div className="report-inner">
            {renderChart()}
            
            {tableData.length > 0 && (
              <>
                <div className="separator"></div>
                {renderTable()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;