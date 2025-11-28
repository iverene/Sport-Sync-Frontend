import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Product({ product, onAdd, disabled }) {
  const isLowStock = product.quantity > 0 && product.quantity < 20;
  const isOutOfStock = product.quantity === 0;

  return (
    <div
      className={`
        relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200
        ${disabled 
          ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" 
          : "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-200"
        }
      `}
    >
      {/* Top Section: Header & Price */}
      <div>
        <h3 className="font-semibold text-slate-700 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5em]">
          {product.product_name}
        </h3>
        <p className="font-bold text-navyBlue text-xl tracking-tight">
          ₱{product.selling_price.toLocaleString()}
        </p>
      </div>

      {/* Bottom Section: Stock & Action */}
      <div className="flex items-end justify-between">
        
        {/* Stock Indicator */}
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit
            ${isOutOfStock ? "bg-red-50 text-red-600" : 
              isLowStock ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}
          `}>
            {isOutOfStock ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
            {product.quantity} left
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all
            ${disabled
              ? "bg-slate-200 text-slate-400"
              : "bg-navyBlue text-white hover:bg-darkGreen hover:scale-110 active:scale-95"
            }
          `}
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}