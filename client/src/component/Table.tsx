import React, { useState, useEffect } from 'react';
import styles from './Table.module.css';
import axios from 'axios';

interface FiiDiiEntry {
  date: string;
  fii: {
    grossPurchase: string;
    grossSales: string;
    netPurchaseSales: string;
  };
  dii: {
    grossPurchase: string;
    grossSales: string;
    netPurchaseSales: string;
  };
}

interface TableData {
  date: string;
  grossPurchase: number;
  grossSales: number;
  netPurchaseSales: number;
}

const Table: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Fii' | 'Dii'>('Fii');
  const [fiiData, setFiiData] = useState<TableData[]>([]);
  const [diiData, setDiiData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:5003/api/fii-dii');
        
        
        const data: FiiDiiEntry[] = response.data;
        
        // Format the FII data
        const formattedFiiData: TableData[] = data
          .filter(item => 
            item.fii.grossPurchase && 
            item.fii.grossSales && 
            item.fii.netPurchaseSales
          )
          .map(item => ({
            date: item.date,
            grossPurchase: parseFloat(item.fii.grossPurchase.replace(/,/g, '')),
            grossSales: parseFloat(item.fii.grossSales.replace(/,/g, '')),
            netPurchaseSales: parseFloat(item.fii.netPurchaseSales.replace(/,/g, ''))
          }));
        
        // Format the DII data - only include entries where all data is present
        const formattedDiiData: TableData[] = data
          .filter(item => 
            item.dii.grossPurchase && 
            item.dii.grossSales && 
            item.dii.netPurchaseSales
          )
          .map(item => ({
            date: item.date,
            grossPurchase: parseFloat(item.dii.grossPurchase.replace(/,/g, '')),
            grossSales: parseFloat(item.dii.grossSales.replace(/,/g, '')),
            netPurchaseSales: parseFloat(item.dii.netPurchaseSales.replace(/,/g, ''))
          }));
        
        setFiiData(formattedFiiData);
        setDiiData(formattedDiiData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the current data set based on active tab
  const currentData = activeTab === 'Fii' ? fiiData : diiData;

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'Fii' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('Fii')}
        >
          Fii
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Dii' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('Dii')}
        >
          Dii
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading data...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Gross Purchase</th>
              <th>Gross Sales</th>
              <th>Net Purchase / Sales</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.grossPurchase.toFixed(1)}</td>
                  <td>{row.grossSales.toFixed(1)}</td>
                  <td className={row.netPurchaseSales >= 0 ? styles.positive : styles.negative}>
                    {row.netPurchaseSales.toFixed(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.noData}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;