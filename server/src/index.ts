import express, { Request, Response, Application } from 'express';
import axios from 'axios';
import cors from 'cors';

let cheerio: any;
try {
  cheerio = require('cheerio');
  console.log('Cheerio loaded successfully');
} catch (error) {
  console.error('Failed to load cheerio:', error);
}

const app = express();
const PORT = 5003;
const F_TYPES = ['fiicash', 'diicash', 'fii_idx_fut', 'fii_idx_opt', 'fii_stk_fut', 'fii_stk_opt'];
const FLAGS = ['D', 'M', 'Y'];
const cleanHtmlValue = (raw: any): string => {
    if (typeof raw === 'number') {
        return raw.toString();
    }
    if (typeof raw !== 'string') {
        return String(raw || '');
    }
    const cleanStr = raw.replace(/<[^>]+>/g, '').replace(/\\r|\\n|\\t/g, '').trim();
    return cleanStr.replace(/\u00A0/g, ' ');
};
  

app.use(cors());

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

app.get('/api/fii-dii', async (req: Request, res: Response) => {
    try {
      console.log('Starting request');
      
      const { data } = await axios.get('https://www.5paisa.com/share-market-today/fii-dii', {
        timeout: 10000 
      });
      
      console.log('Received response');
      
      const $ = cheerio.load(data);
      // Specifically target the rows in the nsebody_fi tbody
      const tableRows = $('table tbody#nsebody_fi tr');
      console.log(`Found ${tableRows.length} table rows`);
      
      const result: FiiDiiEntry[] = [];
  
      tableRows.each((i: any, row: any) => {
        const columns = $(row).find('td');
        
        if (columns.length >= 7) { 
            const date = $(columns[0]).text().trim();
            
            // FII data
            const fiiGrossPurchase = $(columns[1]).text().trim();
            const fiiGrossSales = $(columns[2]).text().trim();
            const fiiNetPurchaseSales = $(columns[3]).text().trim();
            
            // DII data
            const diiGrossPurchase = $(columns[4]).text().trim();
            const diiGrossSales = $(columns[5]).text().trim();
            const diiNetPurchaseSales = $(columns[6]).text().trim();
    
            result.push({ 
              date, 
              fii: {
                grossPurchase: fiiGrossPurchase,
                grossSales: fiiGrossSales,
                netPurchaseSales: fiiNetPurchaseSales
              },
              dii: {
                grossPurchase: diiGrossPurchase,
                grossSales: diiGrossSales,
                netPurchaseSales: diiNetPurchaseSales
              }
            });
          }
      });
      
      console.log("Successfully processed data:", result);
      res.json(result);
    } catch (err) {
      console.error("Detailed error:", err);
      res.status(500).send('Failed to fetch FII/DII data');
    }
  });

app.get('/api/data', async (req: Request, res: Response): Promise<void> => {
    const ftype = req.query.ftype || 'fiicash';
    const flag = req.query.flag || 'D';

  if (!F_TYPES.includes(ftype as string) || !FLAGS.includes(flag as string)) {
    res.status(400).json({ error: 'Invalid ftype or flag' });
    return ;
  }

  const timestamp = Date.now();
  const url = `https://www.research360.in/market/fiidii/ajax/fiiDiiApiHandler.php?ftype=${ftype}&flag=${flag}&_=${timestamp}`;

  try {
    const response = await axios.get(url);
    const rawData = response.data?.data;

    const processed = rawData.map((row: string[]) => {
      return {
        month: cleanHtmlValue(row[0]),
        netValue: cleanHtmlValue(row[2]),
        grossValue: cleanHtmlValue(row[3]),
        change: cleanHtmlValue(row[4]),
        percentageChange: cleanHtmlValue(row[5]),
      };
    });

    res.json(processed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
})

app.get('/health', (req: Request, res: Response) => {
  res.send('Server is healthy');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});