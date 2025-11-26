import { useState } from "react";
import { X, Scan } from "lucide-react";

export default function Scanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Button to open scanner */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-softWhite text-deepBlue p-3 rounded-lg border border-gray-300 hover:shadow-sm  transition flex items-center justify-center"
      >
        <Scan size={20} />
      </button>

      {/* Scanner popup/modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-charcoalBlack/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-96 p-4  relative space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-gray-700">
                <Scan size={20} />
                <h2>Barcode Scanner</h2>
              </div>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className=" text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            

            {/* Scanner placeholder */}
            <div className="flex flex-col items-center justify-center h-30 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Scanner area placeholder</p>
            </div>

            <p className="text-sm text-gray-400 mt-2 text-center">
              Place barcode in the scanner area.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
