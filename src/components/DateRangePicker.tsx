'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  startDate?: string | null;
  endDate?: string | null;
  onSave: (startDate: string, endDate: string) => void;
  onCancel: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onSave,
  onCancel,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              // If end date is before new start date, clear it
              if (end && e.target.value > end) {
                setEnd('');
              }
            }}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            End Date
          </label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            min={minEndDate}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      
      {start && end && (
        <p className="text-sm text-secondary">
          {calculateDays(start, end)} day{calculateDays(start, end) !== 1 ? 's' : ''} trip
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!start || !end}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          Save Dates
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-secondary hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
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
