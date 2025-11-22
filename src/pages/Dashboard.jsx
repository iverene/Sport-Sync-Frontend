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

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Sale */}
        <KpiCard
          bgColor="#BCD3E4"
          title="Today's Sale"
          icon={<DollarSign />}
          value={`₱${todayRevenue.toLocaleString()}`}
          description={
            <>
              <span className="flex bg-deepBlue/50 p-1 rounded-full font-bold">
                <ArrowUp size={14} /> {saleChange}%
              </span>
              &nbsp;vs yesterday
            </>
          }
        />

        {/* Today's Transactions */}
        <KpiCard
          bgColor="#D4E0EB"
          title="Transactions"
          icon={<ShoppingCart />}
          value={todayTx}
          description={
            <>
              <span className="flex bg-deepBlue/50 p-1 rounded-full font-bold">
                <ArrowUp size={14} /> {txChange}%
              </span>
              &nbsp;vs yesterday
            </>
          }
        />

        {/* Low Stock */}
        <KpiCard
          bgColor="#E7F0F7"
          title="Low Stock Items"
          icon={<Boxes />}
          value={lowStock}
          description={<>Items below reorder point</>}
        />

        {/* Out of Stock */}
        <KpiCard
          bgColor="#F4F8FB"
          title="Out of Stock"
          icon={<AlertTriangle />}
          value={outOfStock}
          description={<>Items requiring immediate attention</>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        	<Chart
          type="bar"
          title="Today's Sales Volume by Category"
          categories={todayCategoryNames}
          series={[{ name: "Sales Volume", data: todayCategoryVolumeValues }]}
          height={320}
        />
        <Chart
          type="bar"
          title="Today's Revenue by Category"
          categories={todayCategoryNames}
          series={[{ name: "Sales Revenue", data: todayCategoryRevenueValues }]}
          height={320}
        />
        <Chart
          type="bar"
          title="Weekly Sales Volume"
          categories={weeklyLabels}
          series={[{ name: "Volume", data: weeklyVolume }]}
          height={320}
        />
        <Chart
          type="bar"
          title="Weekly Sales Revenue"
          categories={weeklyLabels}
          series={[{ name: "Revenue", data: weeklyRevenue }]}
          height={320}
        />

        {/* Top 10 Selling Products Card */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Top 10 Selling Products <TrendingUp size={20} />
            </h3>
          </div>
          <div className="space-y-2">
            {topSelling.map((p, index) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-2 rounded-md border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center text-charcoalBlack bg-lightGray font-semibold rounded-full">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-semibold">{p.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {categoryMap[p.category_id]}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-700">
                  {p.soldQuantity} Sold
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {/* Stock Alerts Card */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Stock Alerts <AlertCircle size={20} />
              </h3>
            </div>
            <div className="space-y-2">
              {stockAlerts.length === 0 ? (
                <p className="text-gray-500">No stock alerts.</p>
              ) : (
                stockAlerts.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-2 rounded-md border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold">{p.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {categoryMap[p.category_id]}
                      </p>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      


      </div>
    </Layout>
  );
}
