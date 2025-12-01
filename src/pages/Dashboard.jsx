import { useState, useEffect, useCallback } from "react"; // ADDED useCallback, useEffect
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import Chart from "../components/Chart";
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowUp,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2 // ADDED
} from "lucide-react";
// import { sales, products, categories, transactions } from "../mockData.js"; // REMOVED MOCK DATA
import API from '../services/api'; // ADDED

// Helper function to process percentage change
const percentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
};

export default function Dashboard() {
  const [todayChartType, setTodayChartType] = useState("revenue"); 
  const [weeklyChartType, setWeeklyChartType] = useState("revenue");
  
  // NEW STATES
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH DATA FUNCTION
  const fetchData = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await API.get('/reports/sales', { 
        params: {
          start_date: startDate,
          end_date: endDate,
          period: 'daily' 
        }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch (MOCK DATES for initial load since the component logic defaults to today/30 days ago)
  useEffect(() => {
    // Default to last 30 days
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    fetchData(start, end);
  }, [fetchData]);


  // --- Data Processing based on API structure ---
  if (loading || !dashboardData) {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <Loader2 className="w-10 h-10 animate-spin text-navyBlue mb-4" />
                <p className="text-slate-500">Loading dashboard...</p>
            </div>
        </Layout>
    );
  }
  
  const { summary, sales_trend, sales_by_category, payment_methods, top_products } = dashboardData;

  // KPIs
  const totalRevenue = parseFloat(summary?.total_revenue || 0);
  const totalTransactions = parseInt(summary?.total_transactions || 0);
  const avgTransaction = parseFloat(summary?.average_transaction_value || 0);
  const topPaymentMethod = summary?.top_payment_method || 'N/A';
  
  // Placeholder for inventory KPIs (will need separate API endpoint if not merged)
  const lowStock = 0; 
  const outOfStock = 0; 

  // Trend Data (Last 2 points for change calculation - requires fetching date range)
  const lastTwoSales = sales_trend.slice(-2);
  const currentSales = lastTwoSales.length >= 1 ? parseFloat(lastTwoSales.slice(-1)[0].total_revenue) : 0;
  const previousSales = lastTwoSales.length >= 2 ? parseFloat(lastTwoSales.slice(-2)[0].total_revenue) : 0;
  
  const currentTx = lastTwoSales.length >= 1 ? parseFloat(lastTwoSales.slice(-1)[0].total_sales_count) : 0;
  const previousTx = lastTwoSales.length >= 2 ? parseFloat(lastTwoSales.slice(-2)[0].total_sales_count) : 0;
  
  const saleChange = percentChange(currentSales, previousSales);
  const txChange = percentChange(currentTx, previousTx);

  // Charts Data
  const trendLabels = sales_trend.map(d => d.date_label);
  const trendRevenue = sales_trend.map(d => parseFloat(d.total_revenue));
  const trendVolume = sales_trend.map(d => parseInt(d.total_sales_count));
  
  const categoryNames = sales_by_category.map(c => c.category_name);
  const categoryRevenue = sales_by_category.map(c => parseFloat(c.total_revenue));
  const categoryVolume = sales_by_category.map(c => parseInt(c.total_volume));

  const paymentLabels = payment_methods.map(p => p.payment_method);
  const paymentCounts = payment_methods.map(p => parseInt(p.usage_count));

  // Top Products List
  const topSelling = top_products;
  const maxSold = Math.max(...topSelling.map(p => p.total_sold), 1);
  const stockAlerts = dashboardData.products_requiring_attention || []; 

  // --- Dynamic Chart Props ---
  const todayChartSeries = todayChartType === "revenue" 
    ? [{ name: "Revenue", data: categoryRevenue, color: "#1f781a" }]
    : [{ name: "Volume", data: categoryVolume, color: "#002B50" }];

  const weeklyChartSeries = weeklyChartType === "revenue"
    ? [{ name: "Revenue", data: trendRevenue, color: "#1f781a" }]
    : [{ name: "Volume", data: trendVolume, color: "#002B50" }];

  return (
    <Layout>
      {/* ... (Header Section unchanged) ... */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-description">Here is what’s happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600 font-medium">
          <Calendar size={16} className="text-navyBlue" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards (UPDATED VALUES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          bgColor="#002B50"
          title="Total Revenue" // Changed to Total Revenue for period
          icon={<DollarSign />}
          value={`₱${totalRevenue.toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
          description={
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${saleChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {saleChange >= 0 ? <ArrowUp size={12} /> : <ArrowUp size={12} className="rotate-180"/>} 
                {Math.abs(saleChange)}%
              </span>
              <span className="opacity-70">vs last period</span>
            </div>
          }
        />

        <KpiCard
          bgColor="#1f781a"
          title="Transactions"
          icon={<ShoppingCart />}
          value={totalTransactions}
          description={
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${txChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                 {txChange >= 0 ? <ArrowUp size={12} /> : <ArrowUp size={12} className="rotate-180"/>} 
                 {Math.abs(txChange)}%
              </span>
              <span className="opacity-70">vs last period</span>
            </div>
          }
        />

        <KpiCard
          bgColor="#f59e0b"
          title="Avg. Transaction"
          icon={<DollarSign />}
          value={`₱${avgTransaction.toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
          description="Average per order value"
        />

        <KpiCard
          bgColor="#ef4444"
          title="Top Payment"
          icon={<AlertTriangle />}
          value={topPaymentMethod}
          description="Most frequently used method"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Category Performance */}
        <Chart
            type="bar"
            title="Category Performance"
            categories={categoryNames}
            series={todayChartSeries}
            height={320}
            filter={
                <select
                    value={todayChartType}
                    onChange={(e) => setTodayChartType(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wide rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-navyBlue/20 cursor-pointer hover:border-slate-300 transition-colors"
                >
                    <option value="revenue">By Revenue</option>
                    <option value="volume">By Volume</option>
                </select>
            }
        />

        {/* Weekly Trend */}
        <Chart
            type="line" // Changed from bar to line for trend analysis
            title="Sales Trend (Revenue & Volume)"
            categories={trendLabels}
            series={weeklyChartSeries}
            height={320}
            filter={
                <select
                    value={weeklyChartType}
                    onChange={(e) => setWeeklyChartType(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wide rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-navyBlue/20 cursor-pointer hover:border-slate-300 transition-colors"
                >
                    <option value="revenue">Revenue</option>
                    <option value="volume">Volume</option>
                </select>
            }
        />
      </div>

      {/* Bottom Section: Top Products & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-navyBlue font-bold text-lg tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} className="text-darkGreen" />
                    Top 10 Selling Products
                </h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[400px] hide-scrollbar">
                {topSelling.map((p, index) => (
                  <div key={index} className="group flex items-center gap-4 p-3 hover:bg-slate-100 rounded-lg transition-colors">
                      {/* Rank Badge */}
                      <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm 
                          ${index < 3 ? 'bg-navyBlue text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {index + 1}
                      </span>
                      
                      {/* Product Info */}
                      <div className="grow min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{p.product_name}</p>
                          <p className="text-xs text-slate-500 truncate">{p.category_name}</p>
                          
                          {/* Visual Progress Bar for Sales Volume */}
                          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-darkGreen rounded-full opacity-80" 
                                  style={{ width: `${(p.total_sold / maxSold) * 100}%` }}
                              ></div>
                          </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                          <p className="font-bold text-navyBlue text-sm">{p.total_sold} Sold</p>
                      </div>
                  </div>
                ))}
            </div>
        </div>

        {/* Stock Alerts (Placeholder, as real data depends on separate model call) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                <h3 className="text-rose-700 font-bold text-lg tracking-tight flex items-center gap-2">
                    <AlertCircle size={20} />
                    Stock Alerts
                </h3>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full">
                    {stockAlerts.length}
                </span>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[400px] space-y-3">
                {stockAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                      <Boxes size={40} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">No stock alerts</p>
                  </div>
                ) : (
                  stockAlerts.map((p) => {
                    return (
                        <div key={p.product_id} className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{p.product_name}</p>
                                    <p className="text-xs text-slate-500">{p.category_name}</p>
                                </div>
                                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                    Critical
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-xs text-rose-600 font-medium">
                                <AlertTriangle size={14} />
                                <span>Restock immediately</span>
                             </div>
                        </div>
                    );
                  })
                )}
            </div>
        </div>

      </div>
    </Layout>
  );
}