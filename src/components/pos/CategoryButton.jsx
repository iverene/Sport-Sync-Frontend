import * as Icons from "lucide-react";


const iconMap = {
  All: "LayoutGrid", 
  Footwear: "Footprints",
  Balls: "CircleDot",
  Apparel: "Shirt",
  Accessories: "Backpack", 
  "Fitness Equipment": "Dumbbell",
};

export default function CategoryButton({ categories, active, onSelect }) {
  const allCategories = [{ id: 0, category_name: "All" }, ...categories];

  return (
    <div className="w-full">
      <div className="flex justify-between gap-3 overflow-x-auto pb-4 hide-scrollbar">
        {allCategories.map((cat) => {
          const IconName = iconMap[cat.category_name] || "Tag";
          const Icon = Icons[IconName] || Icons.Tag;
          
          const isActive = active === cat.category_name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.category_name)}
              className={`
                group flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? "bg-darkGreen text-white border-darkGreen shadow-md ring-2 ring-navyBlue/20"
                    : "bg-softWhite text-slate-600 border-slate-200 hover:border-darkGreen hover:text-darkGreen hover:bg-slate-50"
                }
              `}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-navyBlue"}`} 
              />
              <span>{cat.category_name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}