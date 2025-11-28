import { useState } from "react";
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
} from "lucide-react";
import { sales, products, categories, transactions } from "../mockData.js";
import {
  getRevenueByDate,
  getTransactionsByDate,
  percentChange,
  countLowStock,
  countOutOfStock,
  todayCategoryNames,
  todayCategoryVolumeValues,
  todayCategoryRevenueValues,
  weeklyLabels,
  weeklyVolume,
  weeklyRevenue,
  getCategoryMap,
  getStockAlerts,
  getTopSellingProducts,
} from "../utils/Utils.js";

export default function Dashboard() {
  // State for Chart Toggles
  const [todayChartType, setTodayChartType] = useState("revenue"); 
  const [weeklyChartType, setWeeklyChartType] = useState("revenue");

  // Data Processing
  const todayDate = sales.daily[sales.daily.length - 1].date;
  const yesterdayDate = sales.daily[sales.daily.length - 2].date;

  const todayRevenue = getRevenueByDate(todayDate);
  const yesterdayRevenue = getRevenueByDate(yesterdayDate);
  const saleChange = percentChange(todayRevenue, yesterdayRevenue);

  const todayTx = getTransactionsByDate(todayDate);
  const yesterdayTx = getTransactionsByDate(yesterdayDate);
  const txChange = percentChange(todayTx, yesterdayTx);

  const lowStock = countLowStock();
  const outOfStock = countOutOfStock();

  const categoryMap = getCategoryMap(categories);
  const stockAlerts = getStockAlerts(products);
  const topSelling = getTopSellingProducts(products, transactions, 10);
  
  // Calculate max sales for progress bar width
  const maxSold = Math.max(...topSelling.map(p => p.soldQuantity));

  // --- Dynamic Chart Props ---
  const todayChartSeries = todayChartType === "revenue" 
    ? [{ name: "Revenue", data: todayCategoryRevenueValues, color: "#1f781a" }]
    : [{ name: "Volume", data: todayCategoryVolumeValues, color: "#002B50" }];

  const weeklyChartSeries = weeklyChartType === "revenue"
    ? [{ name: "Revenue", data: weeklyRevenue, color: "#1f781a" }]
    : [{ name: "Volume", data: weeklyVolume, color: "#002B50" }];

  return (
    <Layout>
      {/* Header Section */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          bgColor="#002B50"
          title="Today's Revenue"
          icon={<DollarSign />}
          value={`₱${todayRevenue.toLocaleString()}`}
          description={
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${saleChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {saleChange >= 0 ? <ArrowUp size={12} /> : <ArrowUp size={12} className="rotate-180"/>} 
                {Math.abs(saleChange)}%
              </span>
              <span className="opacity-70">vs yesterday</span>
            </div>
          }
        />

        <KpiCard
          bgColor="#1f781a"
          title="Transactions"
          icon={<ShoppingCart />}
          value={todayTx}
          description={
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${txChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                 {txChange >= 0 ? <ArrowUp size={12} /> : <ArrowUp size={12} className="rotate-180"/>} 
                 {Math.abs(txChange)}%
              </span>
              <span className="opacity-70">vs yesterday</span>
            </div>
          }
        />

        <KpiCard
          bgColor="#f59e0b"
          title="Low Stock Items"
          icon={<Boxes />}
          value={lowStock}
          description="Items below reorder point"
        />

        <KpiCard
          bgColor="#ef4444"
          title="Out of Stock"
          icon={<AlertTriangle />}
          value={outOfStock}
          description="Requires immediate attention"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Today's Performance */}
        <Chart
            type="bar"
            title="Today's Performance by Category"
            categories={todayCategoryNames}
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
            type="bar" 
            title="Weekly Performance Trend"
            categories={weeklyLabels}
            series={weeklyChartSeries}
            height={320}
            filter={
                <select
                    value={weeklyChartType}
                    onChange={(e) => setWeeklyChartType(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wide rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-navyBlue/20 cursor-pointer hover:border-slate-300 transition-colors"
                >
                    <option value="revenue">By Revenue</option>
                    <option value="volume">By Volume</option>
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
                  <div key={p.id} className="group flex items-center gap-4 p-3 hover:bg-slate-100 rounded-lg transition-colors">
                      {/* Rank Badge */}
                      <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm 
                          ${index < 3 ? 'bg-navyBlue text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {index + 1}
                      </span>
                      
                      {/* Product Info */}
                      <div className="grow min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{p.product_name}</p>
                          <p className="text-xs text-slate-500 truncate">{categoryMap[p.category_id]}</p>
                          
                          {/* Visual Progress Bar for Sales Volume */}
                          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-darkGreen rounded-full opacity-80" 
                                  style={{ width: `${(p.soldQuantity / maxSold) * 100}%` }}
                              ></div>
                          </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                          <p className="font-bold text-navyBlue text-sm">{p.soldQuantity} Sold</p>
                      </div>
                  </div>
                ))}
            </div>
        </div>

        {/* Stock Alerts  */}
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

                    const isOutOfStock = true; 
                    
                    return (
                        <div key={p.id} className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{p.product_name}</p>
                                    <p className="text-xs text-slate-500">{categoryMap[p.category_id]}</p>
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