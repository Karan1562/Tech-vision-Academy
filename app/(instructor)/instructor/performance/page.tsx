import { getPerformance } from "@/app/actions/getPerformance";
import Chart from "@/components/performance/Chart";
import Chart2 from "@/components/performance/Chart2";
import DataCard from "@/components/performance/DataCard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const PerformancePage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { data, totalRevenue, totalSales } = await getPerformance(userId);
  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DataCard value={totalRevenue} label="Total Revenue" shouldFormat />
          <DataCard value={totalSales} label="Total Sales" />
        </div>
        <div className="flex mt-4 space-x-4">
          <div className="w-1/2">
            <Chart data={data} />
          </div>
          <div className="w-1/2">
            <Chart2 data={data} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformancePage;
