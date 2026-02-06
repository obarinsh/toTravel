'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: string | null;
  endDate?: string | null;
  onSave: (startDate: string, endDate: string) => void;
  onCancel: () => void;
  required?: boolean;
  embedded?: boolean; // When true, removes outer wrapper styling (for use in bottom sheets)
}

export default function DateRangePicker({
  startDate,
  endDate,
  onSave,
  onCancel,
  required = false,
  embedded = false,
}: DateRangePickerProps) {
  const [start, setStart] = useState(startDate || '');
  const [end, setEnd] = useState(endDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end) {
      onSave(start, end);
    }
  };

  // Calculate min end date based on start date
  const minEndDate = start || undefined;
  const tripDays = start && end ? calculateDays(start, end) : 0;

  return (
    <div className={embedded ? 'w-full' : 'bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-border w-full'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(228, 184, 74, 0.15)' }}
          >
            <Calendar size={18} style={{ color: '#E4B84A' }} />
          </div>
          <div>
            <h3 className="font-body text-lg" style={{ fontWeight: 500, color: '#4A4F45' }}>
              Select Dates
            </h3>
            {required && !startDate && !endDate && (
              <p className="text-xs" style={{ color: '#E4B84A' }}>Required to continue</p>
            )}
          </div>
        </div>
        {/* Only show close button if dates exist or not required */}
        {(!required || (startDate && endDate)) && (
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} style={{ color: '#8B9082' }} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Date inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label 
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: '#8B9082' }}
            >
              From
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (end && e.target.value > end) {
                  setEnd('');
                }
              }}
              className="w-full px-3 sm:px-4 py-3 border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5C6B4A]/20 focus:border-[#5C6B4A] transition-all text-sm"
              style={{ 
                borderColor: '#D1D5C8',
                color: '#4A4F45',
              }}
              required
            />
          </div>
          <div>
            <label 
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ color: '#8B9082' }}
            >
              To
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              min={minEndDate}
              className="w-full px-3 sm:px-4 py-3 border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5C6B4A]/20 focus:border-[#5C6B4A] transition-all text-sm"
              style={{ 
                borderColor: '#D1D5C8',
                color: '#4A4F45',
              }}
              required
            />
          </div>
        </div>
        
        {/* Trip duration preview */}
        {start && end && (
          <div 
            className="mb-6 p-4 rounded-xl text-center"
            style={{ backgroundColor: 'rgba(92, 107, 74, 0.08)' }}
          >
            <p className="text-sm" style={{ color: '#5C6B4A' }}>
              <span style={{ fontWeight: 500 }}>{tripDays} day{tripDays !== 1 ? 's' : ''}</span>
              <span className="mx-2" style={{ color: '#8B9082' }}>·</span>
              <span style={{ color: '#8B9082' }}>{formatDate(start)} - {formatDate(end)}</span>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Only show cancel button if dates exist or not required */}
          {(!required || (startDate && endDate)) && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-full text-sm font-medium transition-colors border"
              style={{ 
                borderColor: '#E8EBE3',
                color: '#8B9082',
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!start || !end}
            className="flex-1 px-6 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#5C6B4A' }}
          >
            Save Dates
          </button>
        </div>
      </form>
    </div>
  );
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDayDate(startDate: string, dayNumber: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNumber - 1);
  return formatDate(date.toISOString());
}
