import { useEffect, useState, useCallback } from "react"; 
import Layout from "../components/Layout";
import Table from "../components/Table";
import KpiCard from "../components/KpiCard";
import Filter from "../components/Filter";
import Scanner from "../components/Scanner.jsx";
import EditProductModal from "../components/inventory/EditProductModal.jsx";
import AlertModal from "../components/inventory/AlertModal.jsx";
import Toast from "../components/Toast"; 
// import { categories, products } from "../mockData"; // REMOVED MOCK IMPORTS
import { useAuth } from "../context/AuthContext";
// import { getCategoryMap } from "../utils/Utils.js"; // REMOVED MOCK UTILS IMPORT
import API from '../services/api'; // ADDED
import {
  Package,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Trash2,
  Edit,
  PlusCircle,
  X,
  Loader2 // ADDED
} from "lucide-react";

// Helper function to create category map from API response
const getCategoryMap = (categories) => {
  return (categories || []).reduce((acc, cat) => {
    acc[cat.category_id] = cat.category_name; // Note: using category_id from backend model
    return acc;
  }, {});
};

// --- FIX 2: Define Table Columns (Missing in previous version) ---
const columns = [
    { header: "Product", accessor: "Product" },
    { header: "Category", accessor: "Category" },
    { header: "Cost Price", accessor: "Cost Price" },
    { header: "Selling Price", accessor: "Selling Price" },
    { header: "Stock", accessor: "Stock" },
    { header: "Status", accessor: "Status" },
    { header: "Actions", accessor: "Actions" },
];


export default function Inventory() {
  const { user } = useAuth();
  
  // NEW STATES FOR API DATA
  // FIX: Initialize products as an empty array to prevent map() crash
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [inventoryKpis, setInventoryKpis] = useState(null);
  const [loading, setLoading] = useState(true); // Manages initial loading
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    sellingPrice: "0.00",
    costPrice: "0.00",
    initialStock: "0",
    reorderPoint: "10",
    barcode: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockLevel, setSelectedStockLevel] = useState("all");
  
  // FETCH DATA FUNCTION
  const fetchData = useCallback(async () => {
    setLoading(true);
    // FIX: Use empty arrays/null defaults for safety during destructu ring
    let fetchedCategories = [];
    let fetchedProducts = [];
    let fetchedReport = null;

    try {
      // 1. Fetch Categories
      const catResponse = await API.get('/categories');
      fetchedCategories = catResponse.data.data || []; // SAFE DEFAULT

      setCategories(fetchedCategories);
      
      // 2. Fetch Inventory Report/KPIs
      const reportResponse = await API.get('/reports/inventory');
      fetchedReport = reportResponse.data.data || {}; // SAFE DEFAULT

      setInventoryKpis(fetchedReport.summary);
      
      // 3. Fetch Products
      const fetchParams = {
        limit: 1000, 
        search: searchQuery,
        category_id: selectedCategory === 'all' ? undefined : selectedCategory,
      };

      const prodResponse = await API.get('/products', { params: fetchParams });
      fetchedProducts = prodResponse.data.data || []; // SAFE DEFAULT
      
      // Manually filter based on local stock level filter using the report's low stock logic (reorder_level)
      let finalProducts = fetchedProducts;
      
      if (selectedStockLevel !== 'all') {
        finalProducts = finalProducts.filter(p => {
            // FIX: Ensure reorder_level exists or defaults to 5
            const reorderLevel = p.reorder_level || 5; 
            switch(selectedStockLevel) {
                case 'out-of-stock':
                    return p.quantity === 0;
                case 'low-stock':
                    return p.quantity > 0 && p.quantity <= reorderLevel;
                case 'in-stock':
                    return p.quantity > reorderLevel;
                default:
                    return true;
            }
        });
      }
      
      setProducts(finalProducts);
      
      // Trigger Alert Modal Check after fetching
      const lowStockProducts = fetchedReport.products_requiring_attention;
      if (lowStockProducts && lowStockProducts.length > 0) {
        setIsAlertOpen(true);
      }

    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      // If any API call fails, ensure the data arrays are reset or kept empty
      setProducts([]); 
      setCategories([]);
      setInventoryKpis(null);
      setToast({ message: "Failed to load inventory data. Check backend console for details.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStockLevel]); 
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleScan = (scannedBarcode) => {
    // API call to check if product exists by barcode
    API.get(`/products/barcode/${scannedBarcode}`)
      .then(response => {
        const existingProduct = response.data.data;
        setFormData({
          productName: existingProduct.product_name,
          category: String(existingProduct.category_id),
          sellingPrice: existingProduct.selling_price,
          costPrice: existingProduct.cost_price,
          initialStock: existingProduct.quantity,
          reorderPoint: existingProduct.reorder_level || "10",
          barcode: existingProduct.barcode,
        });
        setToast({ message: `Product ${existingProduct.product_name} found!`, type: "info" });
      })
      .catch(() => {
        setFormData({
          productName: "", category: "", sellingPrice: "0.00", costPrice: "0.00", initialStock: "0", reorderPoint: "10",
          barcode: scannedBarcode,
        });
        setToast({ message: `Barcode ${scannedBarcode} not found. Ready to create.`, type: "warning" });
      })
      .finally(() => setIsModalOpen(true));
  };


  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleSaveProduct = async (updatedProduct) => {
    const productId = updatedProduct.product_id;
    // FIX: Use current 'products' state for finding the old product
    const oldProduct = products.find(p => p.product_id === productId); 

    try {
        // 1. Update Product Details (PUT)
        const productDetailsPayload = {
            product_name: updatedProduct.productName, 
            category_id: parseInt(updatedProduct.categoryId), 
            selling_price: parseFloat(updatedProduct.sellingPrice),
            cost_price: parseFloat(updatedProduct.costPrice),
            reorder_level: parseInt(updatedProduct.reorderPoint),
        };
        await API.put(`/products/${productId}`, productDetailsPayload);

        // 2. Update Stock (PATCH) only if quantity changed
        if (oldProduct && oldProduct.quantity !== updatedProduct.quantity) {
             const stockPayload = {
                 quantity: updatedProduct.quantity,
                 change_type: 'Manual Adjustment'
             };
             await API.patch(`/products/${productId}/stock`, stockPayload);
        }

        setToast({ message: "Product updated successfully!", type: "success" });
        fetchData(); // Re-fetch to update the table
        
    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update product.';
        setToast({ message: msg, type: "error" });
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    
    if (!formData.productName || !formData.category || !formData.sellingPrice || !formData.barcode) {
      setToast({ message: "Please fill in all required fields (Name, Category, Price, Barcode).", type: "error" });
      return; 
    }

    try {
      const payload = {
        barcode: formData.barcode,
        product_name: formData.productName,
        category_id: parseInt(formData.category),
        cost_price: parseFloat(formData.costPrice),
        selling_price: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.initialStock),
        reorder_level: parseInt(formData.reorderPoint),
      };

      // API call to create product
      const response = await API.post('/products', payload);
      
      setToast({ message: response.data.message, type: "success" });
      fetchData(); // Re-fetch data to update table
      
      setIsModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add product. Check if barcode already exists.';
      setToast({ message: msg, type: "error" });
    }
  };

  const handleDelete = async (productId) => { 
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await API.delete(`/products/${productId}`);
      setToast({ message: response.data.message, type: "success" });
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete product.';
      setToast({ message: msg, type: "error" });
    }
  };

  const categoryMap = getCategoryMap(categories); 

  // FIX: Use products state as fallback if inventoryKpis is null
  const lowStockList = ((inventoryKpis && inventoryKpis.products_requiring_attention) || products || []).map((p) => ({
    name: p.product_name,
    sku: p.barcode,
    current: p.quantity,
    minimum: p.reorder_level || 5, // Use backend's reorder level
    unit: "units",
  }));

  // FIX: Use products state directly in map, it is initialized to []
  const data = products.map((p) => ({
    id: p.product_id, 
    Product: p.product_name,
    Category: categoryMap[p.category_id] || 'N/A', // Handle case where category is not found
    "Cost Price": `₱${parseFloat(p.cost_price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`,
    "Selling Price": `₱${parseFloat(p.selling_price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`,
    Stock: (
      <span
        className={
          p.quantity === 0
            ? "text-red-500 font-bold"
            : "text-emerald-600 font-bold"
        }
      >
        {p.quantity}
      </span>
    ),
    Status:
      p.quantity === 0 ? (
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">
          Out of Stock
        </span>
      ) : (
        <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-xs font-bold uppercase">
          In Stock
        </span>
      ),
    Actions:
      user.role === "Admin" || user.role === "Staff" ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(p)}
            className="p-1.5 text-slate-500 hover:text-navyBlue bg-slate-100 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(p.product_id)} 
            className="p-1.5 text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : null,
  }));

  const filterConfig = [
    {
      id: "selectedCategory",
      value: selectedCategory,
      onChange: (e) => setSelectedCategory(e.target.value),
      options: [
        { value: "all", label: "All Categories" },
        // FIX: Added key prop in map inside Filter component (this part is assumed to be fixed in Filter.jsx)
        ...categories.map((cat) => ({
          value: String(cat.category_id), 
          label: cat.category_name,
        })),
      ],
    },
    {
      id: "selectedStockLevel",
      value: selectedStockLevel,
      onChange: (e) => setSelectedStockLevel(e.target.value),
      options: [
        { value: "all", label: "All Stock Levels" },
        { value: "in-stock", label: "In Stock" },
        { value: "low-stock", label: "Low Stock" },
        { value: "out-of-stock", label: "Out of Stock" },
      ],
    },
  ];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="mb-5 flex justify-between items-start">
          <div>
            <h1 className="page-title">Inventory</h1>
            <p className="page-description">
              Manage your sports equipment and stock levels
            </p>
          </div>

          <div className="flex flex-row justify-end items-center gap-4 shrink-0 mt-15 lg:mt-0">
            {/* FIX: Ensure key is used if scanner is rendered in a list or repeated map */}
            <Scanner key="main-scanner" onScan={handleScan} /> 
            
            {(user.role === "Admin" || user.role === "Staff") && (
              <button
                onClick={() => {
                  setFormData({
                    productName: "",
                    category: "",
                    sellingPrice: "0.00",
                    costPrice: "0.00",
                    initialStock: "0",
                    reorderPoint: "10",
                    barcode: "",
                  });
                  setIsModalOpen(true);
                }}
                className="text-softWhite px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                style={{ backgroundColor: "#004B8D" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#003366")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#004B8D")
                }
              >
                <PlusCircle size={18} />
                Add Product
              </button>
            )}
          </div>
        </div>

        {loading ? ( 
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-navyBlue" />
                <p className="text-slate-500 mt-4">Loading inventory data from server...</p>
            </div>
        ) : (
        <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products */}
          <KpiCard
            bgColor="#002B50"
            title="Total Products"
            icon={<Package />}
            value={inventoryKpis?.total_products || 0}
          />

          {/* Low Stock */}
          <KpiCard
            bgColor="#F39C12"
            title="Low Stock"
            icon={<AlertTriangle />}
            value={inventoryKpis?.low_stock_count || 0}
          />

          {/* Out of Stock */}
          <KpiCard
            bgColor="#E74C3C"
            title="Out of Stock"
            icon={<TrendingDown />}
            value={inventoryKpis?.out_of_stock_count || 0}
          />

          {/* Inventory Value */}
          <KpiCard
            bgColor="#1f781a"
            title="Inventory Value"
            icon={<DollarSign />}
            value={`₱${(inventoryKpis?.total_inventory_value || 0).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
        </div>

        {/* Reusable Filter */}
        <Filter
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder="Search products by name..."
          filters={filterConfig}
          showClearButton={
            searchQuery ||
            selectedCategory !== "all" ||
            selectedStockLevel !== "all"
          }
          onClear={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedStockLevel("all");
          }}
          resultsCount={`Showing ${products.length} products`}
        />

        {/* Table */}
        <Table
          tableName="All Products Inventory"
          columns={columns}
          data={data}
          rowsPerPage={10}
        />
        </>
        )} 
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-charcoalBlack/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-softWhite rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-navyBlue flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-200">
                  {products.find(p => p.barcode === formData.barcode) 
                    ? "Product Details" 
                    : "Add New Sports Product"}
                </h2>
                <p className="text-sm text-gray-200 mt-1">
                  {products.find(p => p.barcode === formData.barcode)
                    ? "View or replicate existing product details."
                    : "Fill in the details below to add a new item."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-slateGray transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6"> 
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      placeholder="Product name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price <span className="text-red-500">*</span> (₱)
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price (₱)
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      name="initialStock"
                      value={formData.initialStock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue focus:border-transparent bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    required
                  />
                </div>
              </div>
            

            {/* Modal Footer */}
            <div className="p-6">
              <button
                type="submit"
                className="w-full bg-navyBlue text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                Add Product
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER TOAST HERE */}
      {toast && (
        <div className="relative z-[9999]">
            <Toast
            message={toast.message}
            type={toast.type}
            duration={2000}
            onClose={() => setToast(null)}
            />
        </div>
      )}


      {isAlertOpen && (
        <AlertModal
          lowStockItems={lowStockList}
          onClose={() => setIsAlertOpen(false)}
        />
      )}

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />
    </Layout>
  );
}