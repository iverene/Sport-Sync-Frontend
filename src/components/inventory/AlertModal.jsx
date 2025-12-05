import { X, AlertTriangle, PackageX } from "lucide-react";

export default function AlertModal({ lowStockItems = [], onClose }) {
  // ✅ DEBUG: Log what we're receiving
  console.log('AlertModal received lowStockItems:', lowStockItems);
  console.log('Number of items:', lowStockItems.length);

  // ✅ FIX: Don't render if there are no items
  if (!lowStockItems || lowStockItems.length === 0) {
    console.warn('AlertModal: No low stock items to display');
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative px-6 pt-6 pb-4">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          {/* Alert Icon */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full border-3 border-red-600 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          
          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
          </div>
          
          {/* Subtitle */}
          <p className="text-center text-gray-600 text-sm mb-2">
            <span className="font-bold text-red-600">{lowStockItems.length}</span> item(s) are running low on stock
          </p>
        </div>

        {/* Items List */}
        <div className="px-6 pb-6 max-h-80 overflow-y-auto">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <PackageX size={48} className="mx-auto mb-3 opacity-50" />
              <p>No low stock items found</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {lowStockItems.map((item, index) => (
                <li 
                  key={index} 
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        SKU: {item.sku}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-red-600 font-medium">
                          Current: {item.current} {item.unit}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          Min: {item.minimum} {item.unit}
                        </span>
                      </div>
                    </div>
                    {item.current === 0 && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        OUT
                      </span>
                    )}
                    {item.current > 0 && item.current <= item.minimum && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                        LOW
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-navyBlue hover:bg-navyBlue/90 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}