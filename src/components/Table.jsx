import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Table({ tableName, columns = [], data = [], rowsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const goNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return (
    <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-white overflow-x-auto">
      {tableName && <h3 className="text-lg text-gray-800 font-semibold mb-4">{tableName}</h3>}

      <table className="min-w-full divide-y divide-gray-400">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-4 py-2 text-left text-xs font-bold text-charcoalBlack uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-2 text-center text-gray-400">
                No data available
              </td>
            </tr>
          ) : (
            currentData.map((row, idx) => (
              <tr key={idx} className="hover:bg-lightGray/40">
                {columns.map((col, i) => (
                  <td key={i} className="px-4 py-2 text-sm text-charcoalBlack">
                    {col.render ? col.render(row, idx) : row[col.accessor] || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <div className="flex gap-2">
            <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 flex items-center justify-center hover:bg-darkGreen hover:text-softWhite"
            >
                <ArrowLeft size={16} />
            </button>
            <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 flex items-center justify-center hover:bg-darkGreen hover:text-softWhite"
            >
                <ArrowRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span>of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}
