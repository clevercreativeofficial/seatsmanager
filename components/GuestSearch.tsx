'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { UserRoundPlus } from 'lucide-react';
import { Table } from '@/lib/types';

interface GuestSearchProps {
  tables: Table[];
  onGuestSelect: (table: Table, seatId: string) => void;
}

export function GuestSearch({ tables, onGuestSelect }: GuestSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{table: Table, seatId: string, guestName: string}[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const matches = [];
    for (const table of tables) {
      for (const seat of table.seats) {
        if (seat.guest_name?.toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            table,
            seatId: seat.id,
            guestName: seat.guest_name
          });
        }
      }
    }
    setResults(matches);
  }, [query, tables]);

  return (
    <div className="relative w-full max-w-md mx-4">
      <div className="relative">
        <Input
          placeholder="Search guests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
        <UserRoundPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {query && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-y-auto border">
          {results.length > 0 ? (
            results.map(({ table, seatId, guestName }) => (
              <div
                key={seatId}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onGuestSelect(table, seatId);
                  setQuery('');
                }}
              >
                <p className="font-medium">{guestName}</p>
                <p className="text-sm text-gray-500">
                  {table.label}, Seat {table.seats.find(s => s.id === seatId)?.seat_no}
                </p>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500">No guests found</div>
          )}
        </div>
      )}
    </div>
  );
}