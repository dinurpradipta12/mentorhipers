"use client";

import React from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const DailyGrowthChart = ({ data, reportFilter }: any) => {
  // 1. Calculate Daily Data Points
  const getDailyDataPoints = () => {
    const start = new Date(reportFilter.startDate);
    const end = new Date(reportFilter.endDate);
    const diffMs = end.getTime() - start.getTime();

    // Add 1 to ensure inclusion of both start and end days
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);

    // If visualizing more than 14 days, group them into ~7 data points to avoid crowding
    // Otherwise, show day by day.
    const maxDataPoints = totalDays <= 14 ? totalDays : 7;
    const blockSize = totalDays / maxDataPoints;

    return Array.from({ length: maxDataPoints }).map((_, i) => {
      const dStart = new Date(start);
      dStart.setDate(start.getDate() + (i * blockSize));
      const dEnd = new Date(start);
      dEnd.setDate(start.getDate() + ((i + 1) * blockSize));

      const inBlock = data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= dStart && itemDate < dEnd;
      });

      // Just for labeling
      const isSingleDay = blockSize <= 1.5;
      const label = isSingleDay
        ? dStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : `${dStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}-${new Date(dEnd.getTime() - 1000 * 60 * 60 * 24).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;

      return {
        name: label,
        reach: inBlock.reduce((sum: number, item: any) => sum + Number(item.metrics?.reach || 0), 0),
        views: inBlock.reduce((sum: number, item: any) => sum + Number(item.metrics?.views || 0), 0)
      };
    });
  };

  const chartData = getDailyDataPoints();

  return (
    <div className="w-full h-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0052FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            dy={10}
          />
          <Tooltip
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#fbbf24"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorViews)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }}
          />
          <Area
            type="monotone"
            dataKey="reach"
            stroke="#0052FF"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorReach)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#0052FF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyGrowthChart;
