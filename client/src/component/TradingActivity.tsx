import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './TradingActivity.module.css';
import axios from 'axios';

const TYPE_DISPLAY_NAMES: { [key: string]: string } = {
  'fiicash': 'FII Cash',
  'diicash': 'DII Cash',
  'fii_idx_fut': 'FII Idx Fut',
  'fii_idx_opt': 'FII Idx Opt',
  'fii_stk_fut': 'FII Stk Fut',
  'fii_stk_opt': 'FII Stk Opt'
};

interface TradingData {
  date: string;
  amount: number;
  nifty: number;
  change: number;
  changePercentage: number;
}
interface ApiResponse {
  month: string;
  netValue: string;
  grossValue: string;
  change: string;
  percentageChange: string;
}

const TradingActivity: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('fiicash');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [tradingData, setTradingData] = useState<TradingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const flag = activeTimeframe === 'Daily' ? 'D' : activeTimeframe === 'Monthly' ? 'M' : 'Y';
        const response = await axios.get(`http://localhost:5003/api/data?ftype=${selectedType}&flag=${flag}`);
        
        const formattedData: TradingData[] = response.data.map((item: ApiResponse) => ({
          date: item.month,
          amount: parseFloat(item.netValue.replace(/,/g, '')),
          nifty: parseFloat(item.grossValue.replace(/,/g, '')),
          change: parseFloat(item.change.replace(/,/g, '')),
          changePercentage: parseFloat(item.percentageChange.replace(/,/g, ''))
        }));

        setTradingData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load trading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTimeframe, selectedType]);
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>FII & DII Trading Activity</h1>
      
      <div className={styles.filters}>
      <div className={styles.dropdownContainer}>
          <button 
            className={styles.dropdown}
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            {TYPE_DISPLAY_NAMES[selectedType]} <ChevronDown className="inline ml-2" size={16} />
          </button>
          
          {showTypeDropdown && (
            <div className={styles.dropdownMenu}>
              {Object.entries(TYPE_DISPLAY_NAMES).map(([type, displayName]) => (
                <button
                  key={type}
                  className={`${styles.dropdownItem} ${selectedType === type ? styles.activeType : ''}`}
                  onClick={() => {
                    setSelectedType(type);
                    setShowTypeDropdown(false);
                  }}
                >
                  {displayName}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {['Daily', 'Monthly', 'Yearly'].map((timeframe) => (
          <button
            key={timeframe}
            className={`${styles.timeFilter} ${
              activeTimeframe === timeframe ? styles.activeFilter : styles.inactiveFilter
            }`}
            onClick={() => setActiveTimeframe(timeframe as 'Daily' | 'Monthly' | 'Yearly')}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>Date</th>
            <th className={styles.tableHeader}>Amount(Cr)</th>
            <th className={styles.tableHeader}>Nifty</th>
            <th className={styles.tableHeader}>Change</th>
            <th className={styles.tableHeader}>Chg %</th>
          </tr>
        </thead>
        <tbody>
          {tradingData.map((row) => (
            <tr key={row.date} className={styles.tableRow}>
              <td className={styles.tableCell}>{row.date}</td>
              <td className={`${styles.tableCell} ${styles.negative}`}>
                {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={styles.tableCell}>
                {row.nifty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.tableCell} ${row.change >= 0 ? styles.positive : styles.negative}`}>
                {row.change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.tableCell} ${row.changePercentage >= 0 ? styles.positive : styles.negative}`}>
                {row.changePercentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.table}>
           <thead>
          <tr>
            <th className={styles.tableHeader}>Date</th>
            <th className={styles.tableHeader}>Amount(Cr)</th>
            <th className={styles.tableHeader}>Nifty</th>
            <th className={styles.tableHeader}>Change</th>
            <th className={styles.tableHeader}>Chg %</th>
          </tr>
        </thead>
        <tbody>
          {tradingData.map((row) => (
            <tr key={row.date} className={styles.tableRow}>
              <td className={styles.tableCell}>{row.date}</td>
              <td className={`${styles.tableCell} ${styles.negative}`}>
                {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={styles.tableCell}>
                {row.nifty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.tableCell} ${row.change >= 0 ? styles.positive : styles.negative}`}>
                {row.change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className={`${styles.tableCell} ${row.changePercentage >= 0 ? styles.positive : styles.negative}`}>
                {row.changePercentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      )}
    </div>
  );
};

export default TradingActivity;