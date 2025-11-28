import { BarChart2, Boxes, LineChart, History } from "lucide-react";
import SalesReport from "../../components/reports/SalesReport";
import InventoryReport from "../../components/reports/InventoryReport";
import Profitability from "../../components/reports/Profitability";
import TransactionHistory from "../../components/reports/TransactionHistory";
import Tabs from "../../components/Tabs";

export default function ManualReportTabs() {
  const tabsData = [
    { id: "sales", label: "Sales Report", icon: BarChart2, content: <SalesReport /> },
    { id: "inventory", label: "Inventory Report", icon: Boxes, content: <InventoryReport /> },
    { id: "profit", label: "Profitability", icon: LineChart, content: <Profitability /> },
    { id: "history", label: "Transaction History", icon: History, content: <TransactionHistory /> },
  ];

  return <Tabs tabs={tabsData} initialTab="sales" />;
}
