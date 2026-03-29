"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  if (total === 0) return null;

  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
