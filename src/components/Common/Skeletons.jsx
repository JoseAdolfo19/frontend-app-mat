import React from 'react';

const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] space-y-4" aria-hidden="true">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonLine className="h-3 w-full" />
    <SkeletonLine className="h-3 w-5/6" />
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/3" />
        </div>
        <SkeletonLine className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-[var(--surface)] rounded-xl animate-pulse">
        {Array.from({ length: cols }).map((_, j) => (
          <SkeletonLine key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8" aria-hidden="true">
    <div className="space-y-2">
      <SkeletonLine className="h-8 w-64" />
      <SkeletonLine className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] space-y-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <SkeletonLine className="h-3 w-20" />
          <SkeletonLine className="h-7 w-16" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export default DashboardSkeleton;
