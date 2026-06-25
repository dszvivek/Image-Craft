import React, { useState, useMemo } from 'react';
import Tesseract from 'tesseract.js';
import { 
  CreditCard, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  FileText, 
  TrendingUp,
  Tag
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';

// Dynamic script loading helpers
const loadPdfJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const loadSheetJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).XLSX) {
      resolve((window as any).XLSX);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      resolve((window as any).XLSX);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

interface Transaction {
  id: string;
  date: Date;
  dateStr: string;
  description: string;
  category: string;
  debit: number | null;
  credit: number | null;
  amount: number; // positive for credit, negative for debit
  balance: number | null;
}

interface StatementInfo {
  bankName: string;
  fileType: 'PDF' | 'CSV' | 'EXCEL' | 'DEMO';
  fileName: string;
  totalTransactions: number;
  extractedDateRange: {
    start: Date | null;
    end: Date | null;
  };
}

const CATEGORIES = [
  'Income',
  'Transport',
  'Entertainment',
  'Shopping',
  'Dining Out',
  'Groceries',
  'Rent & Housing',
  'Utilities',
  'Health & Medical',
  'Transfer',
  'Cash & ATM',
  'Fees & Charges',
  'Taxes',
  'Other'
];

// Helper to auto-categorize transactions based on description keywords
const getAutoCategory = (desc: string): string => {
  const d = desc.toLowerCase();
  if (d.includes('salary') || d.includes('payroll') || d.includes('direct deposit') || d.includes('dividend') || d.includes('interest credit')) return 'Income';
  if (d.includes('uber') || d.includes('lyft') || d.includes('taxi') || d.includes('cab') || d.includes('metro') || d.includes('railway') || d.includes('gas') || d.includes('petrol') || d.includes('fuel')) return 'Transport';
  if (d.includes('netflix') || d.includes('spotify') || d.includes('youtube') || d.includes('hulu') || d.includes('disney') || d.includes('hbo') || d.includes('prime') || d.includes('steam') || d.includes('nintendo') || d.includes('playstation') || d.includes('cinema') || d.includes('movie')) return 'Entertainment';
  if (d.includes('amazon') || d.includes('walmart') || d.includes('target') || d.includes('ebay') || d.includes('aliexpress') || d.includes('shopping') || d.includes('mall') || d.includes('clothing') || d.includes('fashion') || d.includes('store')) return 'Shopping';
  if (d.includes('coffee') || d.includes('starbucks') || d.includes('dunkin') || d.includes('restaurant') || d.includes('cafe') || d.includes('food') || d.includes('pizza') || d.includes('burger') || d.includes('mcdonald') || d.includes('uber eats') || d.includes('doordash') || d.includes('grubhub') || d.includes('swiggy') || d.includes('zomato')) return 'Dining Out';
  if (d.includes('grocery') || d.includes('supermarket') || d.includes('whole foods') || d.includes('trader joe') || d.includes('kroger') || d.includes('safeway') || d.includes('mart')) return 'Groceries';
  if (d.includes('rent') || d.includes('mortgage') || d.includes('landlord') || d.includes('apartment') || d.includes('housing')) return 'Rent & Housing';
  if (d.includes('electric') || d.includes('power') || d.includes('water') || d.includes('gas bill') || d.includes('internet') || d.includes('wifi') || d.includes('comcast') || d.includes('at&t') || d.includes('verizon') || d.includes('mobile') || d.includes('phone')) return 'Utilities';
  if (d.includes('insurance') || d.includes('medical') || d.includes('doctor') || d.includes('hospital') || d.includes('dentist') || d.includes('pharmacy') || d.includes('drug') || d.includes('health') || d.includes('gym') || d.includes('fitness')) return 'Health & Medical';
  if (d.includes('transfer') || d.includes('wire') || d.includes('zelle') || d.includes('venmo') || d.includes('paypal') || d.includes('cash app') || d.includes('revolut')) return 'Transfer';
  if (d.includes('atm') || d.includes('withdrawal') || d.includes('cash withdrawal')) return 'Cash & ATM';
  if (d.includes('fee') || d.includes('charge') || d.includes('interest charge') || d.includes('commission') || d.includes('penalty') || d.includes('annual fee')) return 'Fees & Charges';
  if (d.includes('tax') || d.includes('irs') || d.includes('revenue') || d.includes('government')) return 'Taxes';
  return 'Other';
};

// Robust date string parsing helper
const parseDate = (str: string, forceFormat?: 'DD/MM' | 'MM/DD'): Date | null => {
  const cleaned = str.replace(/\s+/g, ' ').trim();

  // Split date by separators
  const parts = cleaned.split(/[\/\-.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (p0 > 1000) {
      // YYYY-MM-DD format
      const d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    }

    let year = p2;
    if (year < 100) {
      year += year > 50 ? 1900 : 2000;
    }

    if (forceFormat === 'DD/MM') {
      const d = new Date(year, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d;
    } else if (forceFormat === 'MM/DD') {
      const d = new Date(year, p0 - 1, p1);
      if (!isNaN(d.getTime())) return d;
    }

    // Try DD/MM/YYYY
    if (p0 > 12 && p0 <= 31 && p1 >= 1 && p1 <= 12) {
      const d = new Date(year, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d;
    }
    // Try MM/DD/YYYY
    if (p1 > 12 && p1 <= 31 && p0 >= 1 && p0 <= 12) {
      const d = new Date(year, p0 - 1, p1);
      if (!isNaN(d.getTime())) return d;
    }
    // Default fallback (first element day, second month)
    const d = new Date(year, p1 - 1, p0);
    if (!isNaN(d.getTime())) return d;
  }

  let d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Parse strings like "15 Oct 2025" or "Oct 15, 2025"
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const wordParts = cleaned.split(/[\s,]+/);
  if (wordParts.length >= 2) {
    let day = -1;
    let monthIndex = -1;
    let year = new Date().getFullYear();

    for (let i = 0; i < wordParts.length; i++) {
      const partLower = wordParts[i].toLowerCase();
      const index = months.findIndex(m => partLower.startsWith(m));
      if (index !== -1) {
        monthIndex = index;
        if (i === 0) {
          // Format: Month Day Year
          day = parseInt(wordParts[1], 10);
          if (wordParts[2]) {
            const y = parseInt(wordParts[2], 10);
            if (y > 1000) year = y;
          }
        } else {
          // Format: Day Month Year
          day = parseInt(wordParts[0], 10);
          if (wordParts[2]) {
            const y = parseInt(wordParts[2], 10);
            if (y > 1000) year = y;
          }
        }
        break;
      }
    }

    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      d = new Date(year, monthIndex, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
};

// Helper to clean and parse currency strings to numbers
const parseAmount = (str: string): number => {
  const cleaned = str.replace(/[$,₹£€\s]/g, '').replace(/,/g, '');
  return parseFloat(cleaned);
};

// Helper to format Date object into local YYYY-MM-DD string without timezone shift
const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface CurrencyInfo {
  symbol: string;
  code: string;
}

// Scan text to identify statement currency
const detectCurrencyFromText = (text: string, bankName: string): CurrencyInfo => {
  const t = text.toLowerCase();
  
  if (t.includes('₹') || t.includes('inr') || t.includes('rupee') || t.includes('rs.')) {
    return { symbol: '₹', code: 'INR' };
  }
  if (t.includes('£') || t.includes('gbp') || t.includes('sterling')) {
    return { symbol: '£', code: 'GBP' };
  }
  if (t.includes('€') || t.includes('eur') || t.includes('euro')) {
    return { symbol: '€', code: 'EUR' };
  }
  if (t.includes('aed') || t.includes('dirham')) {
    return { symbol: 'AED', code: 'AED' };
  }
  if (t.includes('sar') || t.includes('riyal')) {
    return { symbol: 'SR', code: 'SAR' };
  }
  if (t.includes('¥') || t.includes('jpy') || t.includes('cny')) {
    return { symbol: '¥', code: 'JPY/CNY' };
  }
  if (t.includes('aud') || t.includes('a$')) {
    return { symbol: 'A$', code: 'AUD' };
  }
  if (t.includes('cad') || t.includes('c$')) {
    return { symbol: 'C$', code: 'CAD' };
  }
  
  // Bank name fallback
  const bankLower = bankName.toLowerCase();
  if (bankLower.includes('hdfc') || bankLower.includes('icici') || bankLower.includes('state bank of india') || bankLower.includes('sbi')) {
    return { symbol: '₹', code: 'INR' };
  }
  if (bankLower.includes('barclays') || bankLower.includes('lloyds') || bankLower.includes('santander') || bankLower.includes('natwest')) {
    return { symbol: '£', code: 'GBP' };
  }
  
  return { symbol: '$', code: 'USD' };
};

// Scan text to identify bank names
const detectBankName = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('chase')) return 'Chase Bank';
  if (t.includes('bank of america') || t.includes('bofa')) return 'Bank of America';
  if (t.includes('wells fargo')) return 'Wells Fargo';
  if (t.includes('citibank') || t.includes('citi ')) return 'Citibank';
  if (t.includes('barclays')) return 'Barclays';
  if (t.includes('capital one')) return 'Capital One';
  if (t.includes('hsbc')) return 'HSBC Bank';
  if (t.includes('hdfc')) return 'HDFC Bank';
  if (t.includes('icici')) return 'ICICI Bank';
  if (t.includes('state bank of india') || t.includes(' sbi ')) return 'State Bank of India';
  if (t.includes('lloyds')) return 'Lloyds Bank';
  if (t.includes('santander')) return 'Santander';
  if (t.includes('american express') || t.includes('amex')) return 'American Express';
  if (t.includes('discover')) return 'Discover Card';
  return 'Standard Bank Statement';
};

// Custom parser to split CSV lines properly respecting quotation marks
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};



export const StatementAnalyzer: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isScannedPdf, setIsScannedPdf] = useState<boolean>(false);
  const [scannedPdfFile, setScannedPdfFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statementInfo, setStatementInfo] = useState<StatementInfo | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<CurrencyInfo>({ symbol: '$', code: 'USD' });
  const [detectedDateFormat, setDetectedDateFormat] = useState<string>('DD/MM/YYYY');

  // Filters and table controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'debit' | 'credit'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Derive active preset dynamically from start/end dates and statement range to avoid event loop / state desync bugs
  const activePreset = useMemo(() => {
    if (!statementInfo?.extractedDateRange.start || !statementInfo?.extractedDateRange.end) {
      return 'custom';
    }
    const start = statementInfo.extractedDateRange.start;
    const end = statementInfo.extractedDateRange.end;

    const startStr = formatLocalDate(start);
    const endStr = formatLocalDate(end);

    const startMs = start.getTime();
    const endMs = end.getTime();
    const midMs = startMs + (endMs - startMs) / 2;
    const midDate = new Date(midMs);
    const midStr = formatLocalDate(midDate);

    if (startDate === startStr && endDate === midStr) {
      return 'first-half';
    }
    if (startDate === midStr && endDate === endStr) {
      return 'second-half';
    }
    if (startDate === startStr && endDate === endStr) {
      return 'reset';
    }
    return 'custom';
  }, [startDate, endDate, statementInfo]);
  
  // Editing category on-the-fly
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(15);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Reading file content...');

    try {
      if (extension === '.csv') {
        await processCSV(file);
      } else if (extension === '.xlsx' || extension === '.xls') {
        await processExcel(file);
      } else if (extension === '.pdf') {
        await processPDF(file);
      } else {
        throw new Error('Unsupported file extension. Please select a PDF, CSV, or Excel file.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while parsing statement.');
      setIsProcessing(false);
    }
  };

  // CSV Parsing Flow
  const processCSV = async (file: File) => {
    setProgress(30);
    setStatusMessage('Parsing CSV structure...');
    const text = await file.text();
    const rawLines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const rows = rawLines.map(line => parseCSVLine(line));

    if (rows.length < 2) {
      throw new Error('CSV file is empty or has insufficient rows.');
    }

    setProgress(60);
    setStatusMessage('Analyzing ledger data...');
    parseGridData(rows, 'CSV', file.name);
  };

  // Excel Parsing Flow
  const processExcel = async (file: File) => {
    setProgress(20);
    setStatusMessage('Loading spreadsheet libraries...');
    const XLSX = await loadSheetJS();
    
    setProgress(40);
    setStatusMessage('Reading workbook sheets...');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    setProgress(65);
    setStatusMessage('Extracting data grid...');
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    if (rows.length < 2) {
      throw new Error('Excel sheet is empty or has insufficient rows.');
    }

    const stringifiedRows = rows.map(row => 
      row.map(val => (val === null || val === undefined) ? '' : String(val).trim())
    );

    parseGridData(stringifiedRows, 'EXCEL', file.name);
  };

  // Helper to map and parse tabular lists (CSV/Excel grid rows)
  const parseGridData = (rows: string[][], format: 'CSV' | 'EXCEL', fileName: string) => {
    let headerRowIdx = -1;
    let colMap = {
      date: -1,
      description: -1,
      debit: -1,
      credit: -1,
      amount: -1,
      balance: -1
    };

    // Find the header row (contains keywords)
    for (let r = 0; r < Math.min(rows.length, 25); r++) {
      const row = rows[r].map(c => c.toLowerCase());
      const hasDate = row.some(c => c.includes('date'));
      const hasDesc = row.some(c => c.includes('desc') || c.includes('particular') || c.includes('narrative') || c.includes('detail') || c.includes('transaction'));
      const hasAmount = row.some(c => c.includes('amount') || c.includes('debit') || c.includes('credit') || c.includes('withdraw') || c.includes('deposit') || c.includes('bal'));
      
      if (hasDate && (hasDesc || hasAmount)) {
        headerRowIdx = r;
        row.forEach((cell, idx) => {
          if (cell.includes('date')) colMap.date = idx;
          else if (cell.includes('desc') || cell.includes('particular') || cell.includes('narrative') || cell.includes('detail') || cell.includes('payee') || cell.includes('remark')) colMap.description = idx;
          else if (cell.includes('debit') || cell.includes('withdraw') || cell.includes('out') || cell.includes('spend')) colMap.debit = idx;
          else if (cell.includes('credit') || cell.includes('deposit') || cell.includes('in') || cell.includes('payment')) colMap.credit = idx;
          else if (cell.includes('balance') || cell.includes('bal')) colMap.balance = idx;
          else if (cell.includes('amount') || cell.includes('val')) colMap.amount = idx;
        });
        break;
      }
    }

    // Heuristic fallback if header row isn't explicitly defined
    if (headerRowIdx === -1) {
      // Analyze values per column to assign indexes
      const colAnalysis = Array.from({ length: rows[0].length }, () => ({
        dateCount: 0,
        numberCount: 0,
        stringLenTotal: 0,
        rowsFilled: 0
      }));

      rows.slice(0, 100).forEach(row => {
        row.forEach((cell, colIdx) => {
          if (colIdx >= colAnalysis.length) return;
          if (!cell) return;
          colAnalysis[colIdx].rowsFilled++;
          colAnalysis[colIdx].stringLenTotal += cell.length;
          
          if (parseDate(cell)) colAnalysis[colIdx].dateCount++;
          const num = parseAmount(cell);
          if (!isNaN(num)) colAnalysis[colIdx].numberCount++;
        });
      });

      // Date is highest date count column
      let bestDateCol = -1;
      let maxDates = 0;
      colAnalysis.forEach((analysis, idx) => {
        if (analysis.dateCount > maxDates && analysis.dateCount > analysis.rowsFilled * 0.3) {
          maxDates = analysis.dateCount;
          bestDateCol = idx;
        }
      });
      colMap.date = bestDateCol;

      // Numeric columns (sorted by fill count)
      const numericCols = colAnalysis
        .map((a, idx) => ({ idx, count: a.numberCount, isDate: idx === bestDateCol }))
        .filter(x => !x.isDate && x.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(x => x.idx);

      if (numericCols.length >= 3) {
        colMap.debit = numericCols[0];
        colMap.credit = numericCols[1];
        colMap.balance = numericCols[2];
      } else if (numericCols.length === 2) {
        colMap.amount = numericCols[0];
        colMap.balance = numericCols[1];
      } else if (numericCols.length === 1) {
        colMap.amount = numericCols[0];
      }

      // Description is longest average string column
      let bestDescCol = -1;
      let maxAvgLen = 0;
      colAnalysis.forEach((analysis, idx) => {
        if (idx === colMap.date || numericCols.includes(idx)) return;
        const avg = analysis.stringLenTotal / (analysis.rowsFilled || 1);
        if (avg > maxAvgLen) {
          maxAvgLen = avg;
          bestDescCol = idx;
        }
      });
      colMap.description = bestDescCol;

      headerRowIdx = 0; // Assume data starts immediately or row 0 is header
    }

    // Date format detection scan for CSV/Excel
    let ddMMVotes = 0;
    let mmDDVotes = 0;
    rows.slice(headerRowIdx + 1).forEach(row => {
      if (row.length > colMap.date) {
        const parts = (row[colMap.date] || '').split(/[\/\-.]/);
        if (parts.length === 3) {
          const p0 = parseInt(parts[0], 10);
          const p1 = parseInt(parts[1], 10);
          if (p0 > 12 && p0 <= 31 && p1 <= 12) ddMMVotes++;
          if (p1 > 12 && p1 <= 31 && p0 <= 12) mmDDVotes++;
        }
      }
    });
    const detectedFormat = ddMMVotes >= mmDDVotes ? 'DD/MM' : 'MM/DD';

    // Extract records
    const txList: Transaction[] = [];
    let cumulativeText = '';

    rows.slice(headerRowIdx + 1).forEach((row, rIndex) => {
      if (row.length <= Math.max(colMap.date, colMap.description)) return;
      const dateCell = row[colMap.date];
      if (!dateCell) return;
      
      const parsedD = parseDate(dateCell, detectedFormat);
      if (!parsedD) return;

      const desc = row[colMap.description] || 'Transaction';
      cumulativeText += ' ' + desc;

      let debit: number | null = null;
      let credit: number | null = null;
      let balance: number | null = null;

      // Parse Debit/Credit/Amount cells
      if (colMap.debit !== -1 && row[colMap.debit]) {
        const val = parseAmount(row[colMap.debit]);
        if (!isNaN(val) && val !== 0) debit = Math.abs(val);
      }
      if (colMap.credit !== -1 && row[colMap.credit]) {
        const val = parseAmount(row[colMap.credit]);
        if (!isNaN(val) && val !== 0) credit = Math.abs(val);
      }
      if (colMap.balance !== -1 && row[colMap.balance]) {
        const val = parseAmount(row[colMap.balance]);
        if (!isNaN(val)) balance = val;
      }
      if (colMap.amount !== -1 && row[colMap.amount]) {
        const val = parseAmount(row[colMap.amount]);
        if (!isNaN(val) && val !== 0) {
          if (val < 0) debit = Math.abs(val);
          else credit = val;
        }
      }

      // Fallback: if we have amount and credit/debit are not resolved
      if (debit === null && credit === null) return; // skip rows without transaction value

      txList.push({
        id: `tx-${rIndex}-${Math.random().toString(36).substr(2, 5)}`,
        date: parsedD,
        dateStr: dateCell,
        description: desc.trim().replace(/\s+/g, ' '),
        category: getAutoCategory(desc),
        debit,
        credit,
        amount: credit !== null ? credit : -(debit || 0),
        balance
      });
    });

    if (txList.length === 0) {
      throw new Error('No valid transaction records could be extracted from grid structure.');
    }

    // Sort transactions chronologically
    txList.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Validate balances mathematically
    reconstructLedgerMath(txList);

    const minDate = txList[0].date;
    const maxDate = txList[txList.length - 1].date;

    const bankName = detectBankName(cumulativeText || fileName);
    const headerText = rows[headerRowIdx]?.join(' ') || '';
    const currency = detectCurrencyFromText(headerText + ' ' + cumulativeText + ' ' + fileName, bankName);

    setTransactions(txList);
    setDetectedCurrency(currency);
    setDetectedDateFormat(detectedFormat === 'DD/MM' ? 'DD/MM/YYYY' : 'MM/DD/YYYY');
    setStatementInfo({
      bankName,
      fileType: format,
      fileName,
      totalTransactions: txList.length,
      extractedDateRange: { start: minDate, end: maxDate }
    });

    // Populate filters
    setStartDate(formatLocalDate(minDate));
    setEndDate(formatLocalDate(maxDate));

    setProgress(100);
    setIsProcessing(false);
  };

  // Reusable helper to extract transaction items from parsed text lines
  const parseTransactionsFromTextLines = (allLines: string[], forceFormat?: 'DD/MM' | 'MM/DD'): Transaction[] => {
    const dateRegexes = [
      /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
      /\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/,
      /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:\d{2,4})?)\b/i,
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:\s*,\s*\d{2,4})?)\b/i
    ];
    const numRegex = /[+-]?\b\d[\d,]*\.\d{2}\b/g;
    const txList: Transaction[] = [];

    allLines.forEach((line, lineIdx) => {
      let matchedDateStr = '';
      let matchedDate: Date | null = null;
      for (const regex of dateRegexes) {
        const match = line.match(regex);
        if (match) {
          const parsed = parseDate(match[1], forceFormat);
          if (parsed) {
            matchedDateStr = match[1];
            matchedDate = parsed;
            break;
          }
        }
      }
      if (!matchedDate) return;
      const textWithoutDate = line.replace(matchedDateStr, '').trim();
      const numMatches = textWithoutDate.match(numRegex) || [];
      if (numMatches.length === 0) return;
      let desc = textWithoutDate;
      numMatches.forEach(m => { desc = desc.replace(m, ''); });
      desc = desc.replace(/\b(DR|CR|Dr|Cr|Debit|Credit)\b/gi, '').replace(/[$,₹£€]/g, '').replace(/\s+/g, ' ').trim();
      if (desc === '' || desc === '-' || desc === ',') desc = 'Transaction';
      const amounts = numMatches.map(m => parseAmount(m));
      let debit: number | null = null;
      let credit: number | null = null;
      let balance: number | null = null;
      const isDebitLine = line.toLowerCase().includes('dr') || line.includes('-');
      const isCreditLine = line.toLowerCase().includes('cr') || line.includes('+');
      if (amounts.length === 1) {
        const amt = Math.abs(amounts[0]);
        if (isDebitLine && !isCreditLine) debit = amt;
        else if (isCreditLine) credit = amt;
        else debit = amt;
      } else if (amounts.length === 2) {
        const amt = Math.abs(amounts[0]);
        balance = amounts[1];
        if (numMatches[0] && numMatches[1] && line.indexOf(numMatches[0]) > line.indexOf(numMatches[1])) {
          balance = amounts[0];
          const trAmt = Math.abs(amounts[1]);
          if (isCreditLine) credit = trAmt; else debit = trAmt;
        } else {
          if (isCreditLine) credit = amt; else debit = amt;
        }
      } else if (amounts.length >= 3) {
        const first = amounts[0];
        const second = amounts[1];
        balance = amounts[amounts.length - 1];
        if (first > 0 && (second === 0 || isNaN(second))) debit = first;
        else if (second > 0 && (first === 0 || isNaN(first))) credit = second;
        else { debit = first; credit = second; }
      }
      txList.push({
        id: `tx-pdf-${lineIdx}-${Math.random().toString(36).substr(2, 5)}`,
        date: matchedDate,
        dateStr: matchedDateStr,
        description: desc,
        category: getAutoCategory(desc),
        debit,
        credit,
        amount: credit !== null ? credit : -(debit || 0),
        balance
      });
    });
    return txList;
  };

  // PDF Text Extraction Flow
  const processPDF = async (file: File) => {
    setProgress(20);
    setStatusMessage('Loading PDF libraries...');
    const pdfjsLib = await loadPdfJS();
    setProgress(40);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let allLines: string[] = [];
    let cumulativeText = '';
    for (let p = 1; p <= pdf.numPages; p++) {
      setStatusMessage(`Scanning page ${p} of ${pdf.numPages}...`);
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];
      const lineGroups: { [y: number]: any[] } = {};
      items.forEach((item) => {
        if (!item.str || item.str.trim() === '') return;
        const y = Math.round(item.transform[5] / 4.0) * 4.0;
        if (!lineGroups[y]) lineGroups[y] = [];
        lineGroups[y].push(item);
      });
      const sortedY = Object.keys(lineGroups).map(Number).sort((a, b) => b - a);
      sortedY.forEach((y) => {
        const lineItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
        const lineStr = lineItems.map(item => item.str).join(' ').trim();
        allLines.push(lineStr);
        cumulativeText += ' ' + lineStr;
      });
    }
    if (cumulativeText.trim() === '') {
      setScannedPdfFile(file);
      setIsScannedPdf(true);
      setIsProcessing(false);
      return;
    }

    // Date format detection scan
    let ddMMVotes = 0;
    let mmDDVotes = 0;
    const dateRegexesForScan = [
      /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
      /\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/
    ];
    allLines.forEach(line => {
      for (const regex of dateRegexesForScan) {
        const match = line.match(regex);
        if (match) {
          const parts = match[1].split(/[\/\-.]/);
          if (parts.length === 3) {
            const p0 = parseInt(parts[0], 10);
            const p1 = parseInt(parts[1], 10);
            if (p0 > 12 && p0 <= 31 && p1 <= 12) ddMMVotes++;
            if (p1 > 12 && p1 <= 31 && p0 <= 12) mmDDVotes++;
          }
          break;
        }
      }
    });
    const detectedFormat = ddMMVotes >= mmDDVotes ? 'DD/MM' : 'MM/DD';

    setProgress(80);
    setStatusMessage('Extracting transactions via regex matches...');
    const txList = parseTransactionsFromTextLines(allLines, detectedFormat);
    if (txList.length === 0) {
      throw new Error('Could not identify any transactional structures in PDF. Verify if the PDF is scanned as an image (OCR required) or is password protected.');
    }
    txList.sort((a, b) => a.date.getTime() - b.date.getTime());
    reconstructLedgerMath(txList);
    const minDate = txList[0].date;
    const maxDate = txList[txList.length - 1].date;

    const bankName = detectBankName(cumulativeText || file.name);
    const currency = detectCurrencyFromText(cumulativeText + ' ' + file.name, bankName);

    setTransactions(txList);
    setDetectedCurrency(currency);
    setDetectedDateFormat(detectedFormat === 'DD/MM' ? 'DD/MM/YYYY' : 'MM/DD/YYYY');
    setStatementInfo({
      bankName,
      fileType: 'PDF',
      fileName: file.name,
      totalTransactions: txList.length,
      extractedDateRange: { start: minDate, end: maxDate }
    });

    setStartDate(formatLocalDate(minDate));
    setEndDate(formatLocalDate(maxDate));

    setProgress(100);
    setIsProcessing(false);
  };

  // Run AI OCR on Scanned Statement PDF pages using canvas and Tesseract
  const runPdfOCR = async () => {
    if (!scannedPdfFile) return;
    setIsProcessing(true);
    setIsScannedPdf(false);
    setProgress(10);
    setStatusMessage('Initializing AI OCR Engine...');

    try {
      const pdfjsLib = await loadPdfJS();
      const arrayBuffer = await scannedPdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allLines: string[] = [];
      let cumulativeText = '';

      setStatusMessage('Loading language models (English)...');
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pageProgress = Math.round(m.progress * 100);
            setStatusMessage(`OCR scanning page text: ${pageProgress}%`);
          }
        }
      });

      for (let p = 1; p <= pdf.numPages; p++) {
        setStatusMessage(`Rendering page ${p} of ${pdf.numPages} to canvas...`);
        setProgress(15 + Math.round((p / pdf.numPages) * 20));

        const page = await pdf.getPage(p);
        const scale = 2.0; // Higher scale = better details
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          setStatusMessage(`OCR scanning page ${p} of ${pdf.numPages}...`);
          setProgress(35 + Math.round((p / pdf.numPages) * 55));

          const { data: { text } } = await worker.recognize(canvas);
          const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
          allLines.push(...lines);
          cumulativeText += ' ' + text;
        }
      }

      await worker.terminate();

      // Date format detection scan
      let ddMMVotes = 0;
      let mmDDVotes = 0;
      const dateRegexesForScan = [
        /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
        /\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/
      ];
      allLines.forEach(line => {
        for (const regex of dateRegexesForScan) {
          const match = line.match(regex);
          if (match) {
            const parts = match[1].split(/[\/\-.]/);
            if (parts.length === 3) {
              const p0 = parseInt(parts[0], 10);
              const p1 = parseInt(parts[1], 10);
              if (p0 > 12 && p0 <= 31 && p1 <= 12) ddMMVotes++;
              if (p1 > 12 && p1 <= 31 && p0 <= 12) mmDDVotes++;
            }
            break;
          }
        }
      });
      const detectedFormat = ddMMVotes >= mmDDVotes ? 'DD/MM' : 'MM/DD';

      setStatusMessage('Analyzing extracted OCR transactions...');
      setProgress(95);

      const txList = parseTransactionsFromTextLines(allLines, detectedFormat);

      if (txList.length === 0) {
        throw new Error('OCR completed but failed to recognize any transaction date/amount patterns. Ensure the document is a readable bank statement.');
      }

      // Sort transactions chronologically
      txList.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Reconstruct ledger mathematically using balances
      reconstructLedgerMath(txList);

      const minDate = txList[0].date;
      const maxDate = txList[txList.length - 1].date;

      const bankName = detectBankName(cumulativeText || scannedPdfFile.name);
      const currency = detectCurrencyFromText(cumulativeText + ' ' + scannedPdfFile.name, bankName);

      setTransactions(txList);
      setDetectedCurrency(currency);
      setDetectedDateFormat(detectedFormat === 'DD/MM' ? 'DD/MM/YYYY' : 'MM/DD/YYYY');
      setStatementInfo({
        bankName,
        fileType: 'PDF',
        fileName: scannedPdfFile.name,
        totalTransactions: txList.length,
        extractedDateRange: { start: minDate, end: maxDate }
      });

      setStartDate(formatLocalDate(minDate));
      setEndDate(formatLocalDate(maxDate));

      setProgress(100);
      setIsProcessing(false);
    } catch (err: any) {
      alert(err.message || 'Error occurred while running OCR on statement.');
      setIsProcessing(false);
    }
  };

  // Reconstruct balances & verify credit/debit using ledger equations
  const reconstructLedgerMath = (txs: Transaction[]) => {
    // If we have balances, we can solve debit/credit mapping
    // Eq: Balance_t - Balance_{t-1} = Net_t
    // If Net_t is positive, it's a Credit. If negative, Debit.
    let solvedCount = 0;
    
    for (let i = 1; i < txs.length; i++) {
      const prev = txs[i-1];
      const curr = txs[i];

      if (prev.balance !== null && curr.balance !== null) {
        const diff = curr.balance - prev.balance;

        // Does it match our debit/credit candidates?
        // Round to 2 decimal places to avoid floating arithmetic issues
        const diffRounded = Math.round(diff * 100) / 100;
        
        if (diffRounded > 0) {
          curr.credit = diffRounded;
          curr.debit = null;
          curr.amount = diffRounded;
          solvedCount++;
        } else if (diffRounded < 0) {
          curr.debit = Math.abs(diffRounded);
          curr.credit = null;
          curr.amount = diffRounded;
          solvedCount++;
        }
      }
    }

    // Backfill the first transaction using the second's balance if possible
    if (txs.length > 1 && txs[0].balance !== null && txs[1].balance !== null) {
      const diff = txs[1].balance - txs[0].balance;
      const t1Amt = txs[1].credit !== null ? txs[1].credit : -(txs[1].debit || 0);
      // Verify if balance equation fits
      if (Math.abs(Math.round((diff - t1Amt) * 100)) <= 1) {
        // Balances match chronologically.
        // Let's guess first tx direction. If we have debit/credit parsed, keep it.
      }
    }

    // If balances are completely missing, calculate rolling balance starting at 0
    let balanceVal = 0;
    txs.forEach((tx) => {
      // If we don't have a balance, calculate one as cumulative net
      const txAmt = tx.credit !== null ? tx.credit : -(tx.debit || 0);
      if (tx.balance === null) {
        balanceVal += txAmt;
        tx.balance = Math.round(balanceVal * 100) / 100;
      } else {
        balanceVal = tx.balance; // Sync with extracted balance
      }
    });
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    setIsProcessing(true);
    setProgress(30);
    setStatusMessage('Compiling dummy financial statement...');

    setTimeout(() => {
      setProgress(70);
      setStatusMessage('Analyzing ledger sheets...');
      
      const today = new Date();
      const mockTxs: Transaction[] = [];
      let balance = 4520.80;

      const demoPurchases = [
        { desc: 'SALARY / DIRECT DEPOSIT APEX', credit: 2850.00, category: 'Income' },
        { desc: 'STARBUCKS COFFEE #4492', debit: 6.80, category: 'Dining Out' },
        { desc: 'UBER TRIP RIDE SHARES', debit: 18.50, category: 'Transport' },
        { desc: 'AMAZON.COM MARKETPLACE', debit: 124.99, category: 'Shopping' },
        { desc: 'NETFLIX.COM SUBSCRIPTION', debit: 15.49, category: 'Entertainment' },
        { desc: 'SHELL GAS STATION FUEL', debit: 45.00, category: 'Transport' },
        { desc: 'WHOLE FOODS GROCERIES', debit: 84.20, category: 'Groceries' },
        { desc: 'SPOTIFY PREMIUM MUSIC', debit: 10.99, category: 'Entertainment' },
        { desc: 'ZELLE TRANSFER FROM DAVE', credit: 150.00, category: 'Transfer' },
        { desc: 'CONEDISON UTILITY BILL', debit: 112.45, category: 'Utilities' },
        { desc: 'WALGREENS PHARMACY RX', debit: 34.50, category: 'Health & Medical' },
        { desc: 'ATM CASH WITHDRAWAL FEE', debit: 3.50, category: 'Fees & Charges' },
        { desc: 'ATM CASH WITHDRAWAL', debit: 100.00, category: 'Cash & ATM' },
        { desc: 'CHIPOTLE MEXICAN GRILL', debit: 14.80, category: 'Dining Out' },
        { desc: 'ZELLE TRANSFER TO LANDLORD', debit: 1200.00, category: 'Rent & Housing' },
        { desc: 'TARGET DEPARTMENT STORE', debit: 62.15, category: 'Shopping' },
        { desc: 'MONTHLY SAVINGS INTEREST', credit: 4.25, category: 'Income' }
      ];

      demoPurchases.forEach((item, idx) => {
        const txDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (17 - idx));
        const credit = item.credit || null;
        const debit = item.debit || null;
        const amt = credit !== null ? credit : -debit!;
        balance += amt;

        mockTxs.push({
          id: `demo-${idx}`,
          date: txDate,
          dateStr: txDate.toLocaleDateString(),
          description: item.desc,
          category: item.category,
          debit,
          credit,
          amount: amt,
          balance: Math.round(balance * 100) / 100
        });
      });

      const minDate = mockTxs[0].date;
      const maxDate = mockTxs[mockTxs.length - 1].date;

      setTransactions(mockTxs);
      setDetectedCurrency({ symbol: '$', code: 'USD' });
      setDetectedDateFormat('MM/DD/YYYY');
      setStatementInfo({
        bankName: 'Apex Chase Bank (Demo)',
        fileType: 'DEMO',
        fileName: 'sample_statement_june_2026.pdf',
        totalTransactions: mockTxs.length,
        extractedDateRange: { start: minDate, end: maxDate }
      });

      setStartDate(formatLocalDate(minDate));
      setEndDate(formatLocalDate(maxDate));

      setProgress(100);
      setIsProcessing(false);
    }, 800);
  };

  const handleReset = () => {
    setTransactions([]);
    setStatementInfo(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
    setSortOption('date-desc');
    setCurrentPage(1);
    setDetectedCurrency({ symbol: '$', code: 'USD' });
    setDetectedDateFormat('DD/MM/YYYY');
  };

  // Filter transactions dynamically based on date, search, categories, and type
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(tx => tx.date >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(tx => tx.date <= end);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.description.toLowerCase().includes(q) || 
        tx.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(tx => tx.category === selectedCategory);
    }

    // Debit/Credit type filter
    if (selectedType === 'debit') {
      result = result.filter(tx => tx.debit !== null);
    } else if (selectedType === 'credit') {
      result = result.filter(tx => tx.credit !== null);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'date-desc') return b.date.getTime() - a.date.getTime();
      if (sortOption === 'date-asc') return a.date.getTime() - b.date.getTime();
      if (sortOption === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortOption === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

    return result;
  }, [transactions, startDate, endDate, searchQuery, selectedCategory, selectedType, sortOption]);

  // Aggregate Metrics based on filtered subset
  const metrics = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let creditCount = 0;
    let debitCount = 0;

    filteredTransactions.forEach(tx => {
      if (tx.credit !== null) {
        totalCredit += tx.credit;
        creditCount++;
      }
      if (tx.debit !== null) {
        totalDebit += tx.debit;
        debitCount++;
      }
    });

    const netFlow = totalCredit - totalDebit;

    // Get starting and ending balances for date range
    let startBal: number | null = null;
    let endBal: number | null = null;
    
    if (filteredTransactions.length > 0) {
      // Sort oldest-first to get correct start/end balances
      const chronologically = [...filteredTransactions].sort((a, b) => a.date.getTime() - b.date.getTime());
      startBal = chronologically[0].balance;
      endBal = chronologically[chronologically.length - 1].balance;
    }

    return {
      totalCredit: Math.round(totalCredit * 100) / 100,
      totalDebit: Math.round(totalDebit * 100) / 100,
      creditCount,
      debitCount,
      netFlow: Math.round(netFlow * 100) / 100,
      startBal,
      endBal
    };
  }, [filteredTransactions]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    if (itemsPerPage === 'all') {
      return filteredTransactions;
    }
    const limit = typeof itemsPerPage === 'number' ? itemsPerPage : 15;
    const startIndex = (currentPage - 1) * limit;
    return filteredTransactions.slice(startIndex, startIndex + limit);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 'all') return 1;
    const limit = typeof itemsPerPage === 'number' ? itemsPerPage : 15;
    return Math.ceil(filteredTransactions.length / limit);
  }, [filteredTransactions, itemsPerPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Date', 'Description', 'Category', 'Debit', 'Credit', 'Amount', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        formatLocalDate(tx.date),
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${tx.category}"`,
        tx.debit || '',
        tx.credit || '',
        tx.amount,
        tx.balance || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${statementInfo?.bankName.replace(/\s+/g, '_')}_Filtered_Transactions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Change category of a specific transaction
  const handleUpdateCategory = (id: string, newCategory: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, category: newCategory } : tx));
    setEditingTxId(null);
  };

  // Preset Date range pickers
  const applyPreset = (preset: 'first-half' | 'second-half' | 'reset') => {
    if (!statementInfo?.extractedDateRange.start || !statementInfo?.extractedDateRange.end) return;
    const start = statementInfo.extractedDateRange.start;
    const end = statementInfo.extractedDateRange.end;

    if (preset === 'reset') {
      setStartDate(formatLocalDate(start));
      setEndDate(formatLocalDate(end));
    } else {
      const startMs = start.getTime();
      const endMs = end.getTime();
      const midMs = startMs + (endMs - startMs) / 2;
      const midDate = new Date(midMs);
      
      if (preset === 'first-half') {
        setStartDate(formatLocalDate(start));
        setEndDate(formatLocalDate(midDate));
      } else {
        setStartDate(formatLocalDate(midDate));
        setEndDate(formatLocalDate(end));
      }
    }
    setCurrentPage(1);
  };

  const analyzerSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'PDF Bank Statement Analyzer - ImageGiri',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Convert secure PDF bank statements into clean CSV/Excel spreadsheets offline in your browser. Supports major banks with complete client-side processing.',
    'featureList': [
      'Parse password-protected PDF bank statements',
      'Export parsed transaction tables directly to Excel/CSV',
      '100% offline local parsing, zero server transmission',
      'Support for HDFC, ICICI, SBI, and standard templates'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Bank Statement Analyzer - PDF/CSV/Excel Parser" 
        description="Analyze bank and credit card statements locally inside your browser cache. Calculate debit/credit cashflows, filter date ranges dynamically, and export clean logs securely." 
        keywords="bank statement, credit card statement, statement analyzer, transaction parser, PDF to CSV bank statement, parse excel bank statement, cash flow calculator, finance ledger, free banking tools, privacy finance tool, on-device ledger scanner"
        canonicalUrl="https://imagegiri.com/bank-statement-analyzer"
        schema={analyzerSchema}
      />

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 print:hidden">
          <span className="text-xs font-bold text-teal-650 uppercase tracking-widest px-2.5 py-1 bg-teal-50 border border-teal-100 rounded-full shadow-sm">
            Finance & Ledger Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">
            Bank Statement Analyzer
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Analyze credit card or bank statements locally on-device. Identify categories, cashflows, and dates securely.
          </p>
        </div>

        {/* State: Upload Area */}
        {!statementInfo && !isProcessing && !isScannedPdf && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto animate-fade-in">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                accept="*" // Accept all extensions so we validate manually in React
                title="Drop statement file here"
                subtitle="Supports PDF, CSV, Excel (.xlsx, .xls)"
              />
            </div>
            
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-teal-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-teal-650 bg-teal-50/50 border border-teal-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    On-Device Sandbox
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">100% Client-Side Parsing</h3>
                  <p className="text-xs text-slate-555 leading-relaxed font-medium">
                    Your sensitive banking sheets are processed entirely inside your local browser memory space.
                    No data is ever dispatched to our server, keeping your financial privacy absolutely locked.
                  </p>
                </div>
                
                <div className="pt-6">
                  <button
                    onClick={handleLoadDemo}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-650 to-indigo-650 hover:from-teal-555 hover:to-indigo-555 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-teal-500/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Load Demo Statement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Scanned PDF Prompt */}
        {!statementInfo && !isProcessing && isScannedPdf && (
          <div className="glass-card p-8 rounded-3xl border border-amber-200 bg-amber-50/10 flex flex-col items-center justify-center text-center gap-5 max-w-2xl mx-auto shadow-sm animate-fade-in">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 shadow-xs shrink-0">
              <Info className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">Scanned Document Detected</h3>
              <p className="text-xs text-slate-555 leading-relaxed font-medium max-w-md">
                The uploaded PDF <strong>{scannedPdfFile?.name}</strong> has no digital text layer and appears to be a scanned image or photo. 
                We can run our local AI OCR scanner to digitize the text and extract transaction details.
              </p>
            </div>
            
            <div className="flex gap-3 w-full max-w-xs justify-center pt-2">
              <button
                onClick={runPdfOCR}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-650 to-indigo-650 hover:from-teal-555 hover:to-indigo-555 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-teal-500/10 transition cursor-pointer"
              >
                Run AI OCR Scanner
              </button>
              <button
                onClick={() => { setIsScannedPdf(false); setScannedPdfFile(null); }}
                className="px-4 py-3 bg-white border border-slate-200 text-slate-655 hover:text-slate-800 text-[11px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* State: Processing Spinner */}
        {isProcessing && (
          <div className="glass-card p-10 rounded-3xl flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-150/80 flex items-center justify-center animate-pulse text-teal-650 shadow-xs">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            
            <ProgressBar 
              progress={progress}
              label="Parsing Ledger Document"
              subLabel={statusMessage}
            />

            <div className="p-3.5 bg-white/80 border border-slate-200/50 rounded-2xl max-w-sm flex items-start gap-2.5 text-[11px] text-slate-500 font-medium shadow-xs">
              <Info className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" />
              <span>
                Dynamic libraries compile the parser engine inside your current session memory. Nothing is stored.
              </span>
            </div>
          </div>
        )}

        {/* State: Interactive Dashboard */}
        {statementInfo && !isProcessing && (
          <div className="space-y-6">
            
            {/* Dashboard Document Header Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 print:border-none print:shadow-none">
              
              <div className="flex items-center gap-4 text-left w-full md:w-auto">
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-600 shadow-xs shrink-0">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">
                    Statement Ledger
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">{statementInfo.bankName}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Source: <strong className="font-semibold text-slate-600">{statementInfo.fileName}</strong> ({statementInfo.fileType})
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 shadow-3xs">
                      Currency: {detectedCurrency.code} ({detectedCurrency.symbol})
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-3xs">
                      Date Format: {detectedDateFormat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end print:hidden">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredTransactions.length === 0}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-350 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-350 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Print Report
                </button>
                <button
                  onClick={handleReset}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear File
                </button>
              </div>

            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric: Income/Credit */}
              <div className="glass-card p-5 rounded-2xl border border-emerald-100/60 bg-emerald-50/10 flex flex-col justify-between min-h-[110px] relative overflow-hidden shadow-xs">
                <div className="absolute right-3.5 top-3.5 p-2 bg-emerald-50 text-emerald-650 rounded-xl border border-emerald-100 shadow-2xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Credits</span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    {detectedCurrency.symbol}{metrics.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100/50 w-fit mt-2">
                  {metrics.creditCount} transactions
                </span>
              </div>

              {/* Metric: Expense/Debit */}
              <div className="glass-card p-5 rounded-2xl border border-rose-100/60 bg-rose-50/10 flex flex-col justify-between min-h-[110px] relative overflow-hidden shadow-xs">
                <div className="absolute right-3.5 top-3.5 p-2 bg-rose-50 text-rose-650 rounded-xl border border-rose-100 shadow-2xs">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Debits</span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    {detectedCurrency.symbol}{metrics.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100/50 w-fit mt-2">
                  {metrics.debitCount} transactions
                </span>
              </div>

              {/* Metric: Net Cashflow */}
              <div className={`glass-card p-5 rounded-2xl border flex flex-col justify-between min-h-[110px] relative overflow-hidden shadow-xs ${
                metrics.netFlow >= 0 
                  ? 'border-emerald-100/60 bg-emerald-50/10' 
                  : 'border-rose-100/60 bg-rose-50/10'
              }`}>
                <div className={`absolute right-3.5 top-3.5 p-2 rounded-xl border shadow-2xs ${
                  metrics.netFlow >= 0 ? 'bg-emerald-50 text-emerald-650 border-emerald-100' : 'bg-rose-50 text-rose-650 border-rose-100'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Cashflow</span>
                  <div className={`text-2xl font-black tracking-tight mt-1.5 ${metrics.netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {metrics.netFlow >= 0 ? '+' : '-'}{detectedCurrency.symbol}{Math.abs(metrics.netFlow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit mt-2 ${
                  metrics.netFlow >= 0 
                    ? 'text-emerald-700 bg-emerald-50/80 border-emerald-100/50' 
                    : 'text-rose-700 bg-rose-50/80 border-rose-100/50'
                }`}>
                  {metrics.netFlow >= 0 ? 'Surplus Flow' : 'Deficit Flow'}
                </span>
              </div>

              {/* Metric: Balance Progression */}
              <div className="glass-card p-5 rounded-2xl border border-indigo-100/60 bg-indigo-50/10 flex flex-col justify-between min-h-[110px] relative overflow-hidden shadow-xs">
                <div className="absolute right-3.5 top-3.5 p-2 bg-indigo-50 text-indigo-650 rounded-xl border border-indigo-100 shadow-2xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Closing Balance</span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    {metrics.endBal !== null 
                      ? `${detectedCurrency.symbol}${metrics.endBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : 'N/A'
                    }
                  </div>
                </div>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100/50 w-fit mt-2">
                  Opening: {metrics.startBal !== null ? `${detectedCurrency.symbol}${metrics.startBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                </span>
              </div>

            </div>

            {/* Filter Dashboard Section */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200/80 space-y-5 print:hidden">
              
              {/* Dynamic Date selectors */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl text-teal-650 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Date Range Filter</span>
                    <p className="text-xs text-slate-800 font-bold">Restrict ledger transaction limits</p>
                  </div>
                </div>

                {/* Preset selectors */}
                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => applyPreset('first-half')}
                    className={`preset-btn ${
                      activePreset === 'first-half'
                        ? 'preset-btn-active'
                        : 'preset-btn-inactive'
                    }`}
                  >
                    1st Half
                  </button>
                  <button
                    onClick={() => applyPreset('second-half')}
                    className={`preset-btn ${
                      activePreset === 'second-half'
                        ? 'preset-btn-active'
                        : 'preset-btn-inactive'
                    }`}
                  >
                    2nd Half
                  </button>
                  <button
                    onClick={() => applyPreset('reset')}
                    className={`preset-btn ${
                      activePreset === 'reset'
                        ? 'preset-btn-active'
                        : 'preset-btn-inactive'
                    }`}
                  >
                    Full Range
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white/70 border border-slate-200 p-2 rounded-xl shadow-2xs self-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  />
                  <span className="text-xs text-slate-350 font-bold select-none">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  />
                </div>

              </div>

              <hr className="border-slate-150" />

              {/* Text Search & Category Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search payee or description..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 focus:outline-none text-xs font-medium placeholder-slate-400 shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Category Select */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Type selector */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => { setSelectedType(e.target.value as any); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs appearance-none"
                  >
                    <option value="all">All Flows (Debits/Credits)</option>
                    <option value="debit">Debits Only</option>
                    <option value="credit">Credits Only</option>
                  </select>
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Sort Option */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs appearance-none"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Amount: High to Low</option>
                    <option value="amount-asc">Amount: Low to High</option>
                  </select>
                  <TrendingUp className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

              </div>

            </div>

            {/* Transactions List Table */}
            <div className="glass-card rounded-3xl border border-slate-200/85 overflow-hidden shadow-xs flex flex-col min-h-[450px]">
              
              <div className="bg-slate-50/40 border-b border-slate-200/50 px-6 py-4 flex justify-between items-center print:border-none">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ledger Records</span>
                  <h3 className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {filteredTransactions.length} of {transactions.length} transactions match filters
                  </h3>
                </div>

                {/* Print layout summary header */}
                <div className="hidden print:block text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date Range Printed</span>
                  <span className="text-xs font-bold text-slate-800">{startDate} to {endDate}</span>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/20 text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-150 select-none">
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Payee & Narrative Description</th>
                      <th className="py-3.5 px-4 text-right">Debit (- {detectedCurrency.symbol})</th>
                      <th className="py-3.5 px-4 text-right">Credit (+ {detectedCurrency.symbol})</th>
                      <th className="py-3.5 px-6 text-right">Balance ({detectedCurrency.symbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/30 text-xs transition-colors group">
                          {/* Date */}
                          <td className="py-4 px-6 text-slate-655 font-bold whitespace-nowrap">
                            {tx.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                          </td>
                          
                          {/* Category Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {editingTxId === tx.id ? (
                              <select
                                value={tx.category}
                                onChange={(e) => handleUpdateCategory(tx.id, e.target.value)}
                                onBlur={() => setEditingTxId(null)}
                                autoFocus
                                className="bg-white border border-slate-200 rounded-lg p-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingTxId(tx.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-150 hover:border-teal-200 rounded-md text-[10px] font-bold text-slate-600 transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                              >
                                <Tag className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                                {tx.category}
                              </button>
                            )}
                          </td>
                          
                          {/* Description */}
                          <td className="py-4 px-4 font-semibold text-slate-800 break-words max-w-[280px]">
                            {tx.description}
                          </td>
                          
                          {/* Debit */}
                          <td className="py-4 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                            {tx.debit !== null 
                              ? `-${detectedCurrency.symbol}${tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                              : ''
                            }
                          </td>
                          
                          {/* Credit */}
                          <td className="py-4 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                            {tx.credit !== null 
                              ? `+${detectedCurrency.symbol}${tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                              : ''
                            }
                          </td>
                          
                          {/* Balance */}
                          <td className="py-4 px-6 text-right font-semibold text-slate-500 whitespace-nowrap">
                            {tx.balance !== null 
                              ? `${detectedCurrency.symbol}${tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                              : '-'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-slate-400 font-semibold">
                          No transactions found matching your criteria. Try adjusting the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              {filteredTransactions.length > 0 && (
                <div className="bg-slate-50/20 border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden select-none">
                  
                  {/* Left: Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Show Rows:</span>
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-3xs">
                      {([15, 30, 50, 100, 'all'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase transition cursor-pointer ${
                            itemsPerPage === size
                              ? 'bg-slate-800 text-white shadow-2xs'
                              : 'text-slate-550 hover:text-slate-800'
                          }`}
                        >
                          {size === 'all' ? 'All' : size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Page Navigation (if multiple pages exist) */}
                  {totalPages > 1 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-500">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-3xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Render dynamic page numbers with ellipsis */}
                        {getPageNumbers().map((pageNum, idx) => {
                          if (pageNum === '...') {
                            return (
                              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 font-bold select-none">
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum as number)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                currentPage === pageNum
                                  ? 'bg-teal-650 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-655 hover:text-slate-800 shadow-3xs'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-3xs"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">
                      Showing all {filteredTransactions.length} transactions
                    </span>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Bank Statement Analyzer"
          introText="Extract credit, debit, balances, bank tags, and dates from PDF, CSV, or Excel statements locally in your browser memory sandbox. Fully private, zero cloud transmission."
          competitorComparison={{
            alternatives: ['Cloud financial scanners', 'SaaS banking parsing apps', 'Online ledgers'],
            benefit: 'Most banking parsing web apps command cloud databases, uploading your statement PDF records containing card numbers, home addresses, and spend behavior to third-party endpoints. ImageGiri executes all parsing algorithms locally on client-side JS. No servers, no data exports.'
          }}
          steps={[
            {
              title: 'Upload Statement',
              description: 'Select or drag and drop your bank or credit card statement. Supported formats include PDF, CSV, and Excel (.xlsx, .xls).'
            },
            {
              title: 'Audit Transactions',
              description: 'Review credit/debit totals, net cashflow surplus, and chronological ledger lists automatically categorized based on description tags.'
            },
            {
              title: 'Filter & Export',
              description: 'Modify date ranges dynamically on-the-fly, search specific payees, override categories, and export filtered sheets to CSV or print a report.'
            }
          ]}
          features={[
            'Tabular parser supporting direct XLSX, XLS, and CSV layouts.',
            'Spatial PDF reader extracting structured text rows using PDF.js WebAssembly.',
            'Ledger mathematical verification computing balance offsets to identify transaction flow.',
            'Instant automatic category matching (e.g. Dining, Shopping, Utilities) with live selection overrides.',
            'Dynamic Date range limits to compute credits, debits, and surplus indices on-the-fly.',
            'Offline isolation sandbox matching PWA standards for absolute database confidentiality.'
          ]}
          faq={[
            {
              q: 'Is it safe to upload my bank statement here?',
              a: 'Yes, 100% safe. The application runs strictly client-side. The file never travels over the network. You can disconnect your internet after loading the page and the analyzer will still parse and render perfectly.'
            },
            {
              q: 'Why did the PDF statement fail to load?',
              a: 'Some PDFs contain scanned image pixels rather than text layer vectors. If text selection is disabled on your PDF reader, the tool cannot extract content directly. Additionally, password-encrypted PDFs cannot be opened unless decrypted first.'
            },
            {
              q: 'How does it decide what is a debit versus credit?',
              a: 'The tool looks at column headers (e.g., withdrawals vs deposits) and checks signs. Furthermore, it runs a ledger validation loop comparing consecutive running balances: if your balance increased between row transactions, it registers a credit; if it decreased, a debit.'
            }
          ]}
        />

      </div>
    </div>
  );
};
