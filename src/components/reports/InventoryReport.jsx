import { useState, useEffect, useCallback, useRef } from "react";
import KpiCard from "../../components/KpiCard";
import Table from "../../components/Table";
import ExportButton from "../../components/ExportButton";
import { DollarSign, Box, Boxes, AlertTriangle, Loader2, RefreshCw, Filter } from "lucide-react";
import API from '../../services/api';

const columns = [
    { header: "Category", accessor: "Category" },
    { header: "Products", accessor: "Products" },
    { header: "Total Stock", accessor: "Total Stock" },
    { header: "Total Value", accessor: "Total Value" },
    { header: "Low Stock Counts", accessor: "Low Stock Counts" },
];

const stockColumns = [
    { header: "Product", accessor: "Product" },
    { header: "Current Stock", accessor: "Current Stock" },
    { header: "Reorder Point", accessor: "Reorder Point" },
    { header: "Status", accessor: "Status" },
];

export default function InventoryReport() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const reportRef = useRef(null); 

    // REMOVED: Date/Calendar State (ActiveFilter, ActiveDate, DateRange)

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // REMOVED: Date params. We just want the CURRENT state.
            const response = await API.get('/reports/inventory');
            setReportData(response.data.data);
        } catch (error) {
            console.error("Failed to fetch inventory report:", error.response?.data || error);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !reportData) {
        return (
            <div className="default-container flex flex-col items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-navyBlue mb-4" />
                <p className="text-slate-500">Loading Current Inventory...</p>
            </div>
        );
    }
    
    const safeData = reportData || { summary: {}, inventory_by_category: [], products_requiring_attention: [] };
    const { summary, inventory_by_category, products_requiring_attention } = safeData;

    // ... (Data mapping logic remains the same) ...
    const categoryData = (inventory_by_category || []).map(cat => ({
        Category: cat.category_name,
        Products: cat.product_count,
        "Total Stock": cat.total_stock.toLocaleString(),
        "Total Value": `₱${parseFloat(cat.total_value || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}`,
        "Low Stock Counts": cat.low_stock_count
    }));

    const attentionProducts = (products_requiring_attention || []).map(p => ({
        Product: p.product_name,
        "Current Stock": p.quantity,
        "Reorder Point": p.reorder_level,
        Status: p.quantity === 0 
            ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-red-200">Out of Stock</span> 
            : <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-amber-200">Low Stock</span>,
    }));

    // Stats Logic
    const totalProducts = parseInt(summary?.total_products || 0);
    const lowStockCount = parseInt(summary?.low_stock_count || 0);
    const outOfStockCount = parseInt(summary?.out_of_stock_count || 0);
    // Calculation: Total products usually includes out of stock, so inStock = Total - OutOfStock
    // (Note: Check if your API 'total_products' includes inactive items)
    const inStockCount = totalProducts - outOfStockCount; 

    const exportData = categoryData.map(item => ({
        Category: item.Category,
        Products: item.Products,
        "Total Stock": item["Total Stock"],
        "Total Value": item["Total Value"].replace('₱', 'PHP '), 
        "Low Stock Counts": item["Low Stock Counts"]
    }));

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col space-y-5" ref={reportRef}>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                 <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-navyBlue">Current Inventory Status</h2>
                    <p className="text-sm text-slate-500">As of {currentDate}</p>
                 </div>

                <div className="flex gap-3 justify-end items-center">
                    <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    
                    {/* Replaced CalendarFilter with just the Export Button */}
                    <ExportButton
                        data={exportData}
                        columns={columns}
                        fileName={`Inventory_Snapshot_${new Date().toISOString().split('T')[0]}`}
                        title={`Inventory Snapshot - ${currentDate}`}
                        domElementRef={reportRef} 
                    />
                </div>
            </div>

            {/* KPI Cards (Same as before) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard bgColor="#002B50" title="Total Products" icon={<Boxes />} value={totalProducts} />
                <KpiCard bgColor="#002B50" title="Total Value" icon={<DollarSign />} value={`₱${parseFloat(summary?.total_inventory_value || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}`} />
                <KpiCard bgColor="#F39C12" title="Low Stock" icon={<AlertTriangle />} value={lowStockCount} />
                <KpiCard bgColor="#E74C3C" title="Out of Stock" icon={<Box />} value={outOfStockCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Table tableName="Inventory by Category" columns={columns} data={categoryData} rowsPerPage={10} />
                
                <div className="flex flex-col gap-6">
                    {/* Simple Status Legend */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500 uppercase">Stock Health</span>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-sm text-slate-600">In Stock: <b>{inStockCount}</b></span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-sm text-slate-600">Low: <b>{lowStockCount}</b></span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-600"></span><span className="text-sm text-slate-600">Empty: <b>{outOfStockCount}</b></span></div>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <Table tableName="Attention Required" columns={stockColumns} data={attentionProducts} rowsPerPage={10} />
                    </div>
                </div>
            </div>
        </div>
    );
}