import { useState, useEffect } from "react";
import ExportButton from "../../components/ExportButton";
import CalendarFilter from "../../components/CalendarFilter";
import API from "../../services/api";
import {
  Clock,
  Calendar,
  ChartLine,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";

export default function AutomatedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("Daily");
  const [activeDate, setActiveDate] = useState(new Date());

  const [dateRange, setDateRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get("/reports/history", {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      setReports(response.data.data || []);
    } catch (error) {
      console.error("Failed to load report history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dateRange]);

  const handleDateFilterChange = (filterType, date) => {
    setActiveFilter(filterType);
    setActiveDate(date);

    let start = date,
      end = date;

    switch (filterType) {
      case "Weekly":
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case "Monthly":
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case "Yearly":
        start = startOfYear(date);
        end = endOfYear(date);
        break;
      case "Daily":
      default:
        start = date;
        end = date;
        break;
    }

    setDateRange({
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    });
  };

  const handleDownload = async (reportId, filePath, reportType, format = "pdf") => {
    try {
      // 1. Backend expects "excel" or "pdf" string
      const apiParam = format === "excel" ? "excel" : "pdf";
      // 2. File extension should be "xlsx" or "pdf"
      const extension = format === "excel" ? "xlsx" : "pdf";

      const response = await API.get(`/reports/download`, {
        params: { 
            id: reportId, 
            format: apiParam // Send 'excel' to match backend logic
        },
        responseType: "blob",
      });

      // Logic to clean up the filename based on backend data
      let downloadName = `Report_${reportId}`;
      if (filePath) {
        // Strip existing extension if present in DB path to avoid double extension
        const rawName = filePath.split('/').pop();
        downloadName = rawName.replace(/\.[^/.]+$/, "");
      } else if (reportType) {
        downloadName = `${reportType}_Report`;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${downloadName}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download report. Please try again.");
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* Schedule Header */}
      <div className="default-container">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-800" />
          <h3 className="text-gray-800 font-semibold">Automatic Report Schedule</h3>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex items-center gap-3">
            <div>
              <Calendar size={25} className="text-deepBlue" />
            </div>
            <div>
              <p className="text-sm leading-tight">
                <span className="font-semibold block text-slate-800">Daily Reports</span>
                <span className="text-slate-500 text-xs">Generated at 23:59</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex items-center gap-3">
            <div>
              <ChartLine size={25} className="text-darkGreen" />
            </div>
            <div>
              <p className="text-sm leading-tight">
                <span className="font-semibold block text-slate-800">Weekly Reports</span>
                <span className="text-slate-500 text-xs">Every Sunday at 23:59</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex items-center gap-3">
            <div>
              <TrendingUp size={25} className="text-crimsonRed" />
            </div>
            <div>
              <p className="text-sm leading-tight">
                <span className="font-semibold block text-slate-800">Monthly Reports</span>
                <span className="text-slate-500 text-xs">Last day of month</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <CalendarFilter
          activeFilter={activeFilter}
          activeDate={activeDate}
          onChange={handleDateFilterChange}
        />
      </div>

      {/* List of Reports */}
      <div className="default-container">
        <h3 className="title mb-4">Report History</h3>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-navyBlue" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">
              No automated reports found for the selected period.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.report_id}
                // Responsive: Stack on mobile (flex-col), Row on tablet+ (sm:flex-row)
                className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-navyBlue/30 transition gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-blue-50 text-navyBlue rounded-lg shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-charcoalBlack truncate" title={report.file_path}>
                      {report.file_path || `${report.report_type} Report`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Period: {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="self-end sm:self-auto shrink-0">
                  <ExportButton
                    onExport={(format) =>
                      handleDownload(
                        report.report_id,
                        report.file_path,
                        report.report_type,
                        format
                      )
                    }
                    className="!w-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}