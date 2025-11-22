import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function Chart({ type = "bar", series = [], categories = [], height = 350, title = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const options = {
    chart: {
      type,
      toolbar: { show: false },
      background: "#FAFAFA",
      animations: { enabled: true, easing: "easeout", speed: 1000, dynamicAnimation: { enabled: true, speed: 1000 } },
      padding: 20 ,
    },
    colors: ["#004B8D"],
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "35%",
        endingShape: "rounded",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false, 
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: "0.875rem", fontWeight: 500, colors: "#475569" }, rotate: -20 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "0.75rem", fontWeight: 500, colors: "#475569" } },
    },
    grid: { borderColor: "#E5E7EB", strokeDashArray: 4 },
    tooltip: {
      enabled: true,
      theme: "light",
      style: { fontSize: "0.875rem", fontWeight: 500 },
      y: { formatter: (val) => `₱${val.toLocaleString()}` },
    },
    states: {
      hover: { filter: { type: "lighten", value: 0.15 } },
    },
    fill: { type: "solid", opacity: 1 },
  };

  return (
    <div className={`p-4 rounded-xl border border-gray-200 shadow-sm bg-white transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ReactApexChart type={type} series={series} options={options} height={height} />
    </div>
  );
}
