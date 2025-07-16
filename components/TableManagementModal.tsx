'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Armchair, UserRoundPlus, Loader2 } from 'lucide-react';
import { Table } from '@/lib/types';

interface TableManagementModalProps {
  table: Table | null;
  isSubmitting: boolean;
  onClose: () => void;
  onAssignGuest: (seatId: string, name: string) => Promise<void>;
  onUpdateGuest: (seatId: string, name: string) => Promise<void>;
  onStatusChange: (seatId: string, status: 'present' | 'absent') => Promise<void>;
}

export function TableManagementModal({
  table,
  isSubmitting,
  onClose,
  onAssignGuest,
  onUpdateGuest,
  onStatusChange,
}: TableManagementModalProps) {
  const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');

  const handleSubmit = async () => {
    if (!activeSeatId || !guestName) return;
    
    const isNewGuest = !table?.seats.find(s => s.id === activeSeatId)?.guest_name;
    if (isNewGuest) {
      await onAssignGuest(activeSeatId, guestName);
    } else {
      await onUpdateGuest(activeSeatId, guestName);
    }
    setActiveSeatId(null);
    setGuestName('');
  };

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {table && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Armchair className="h-5 w-5 text-rose-600" />
                Manage {table.label}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {table.seats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium flex items-center gap-1 text-gray-900">
                        <Armchair className="h-4 w-4" />
                        Seat {seat.seat_no}
                      </p>
                      <p className="text-sm text-gray-500">
                        {seat.guest_name || <span className="text-gray-400">Unassigned</span>}
                        {seat.guest_name && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            seat.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {seat.status}
                          </span>
                        )}
                      </p>
                    </div>
                    {seat.guest_name ? (
                      <div className="flex gap-2">
                        <Button
                          variant={seat.status === 'present' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onStatusChange(seat.id, 'present')}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && seat.status === 'present' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : 'Present'}
                        </Button>
                        <Button
                          variant={seat.status === 'absent' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onStatusChange(seat.id, 'absent')}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && seat.status === 'absent' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : 'Absent'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveSeatId(seat.id);
                            setGuestName(seat.guest_name || '');
                          }}
                          disabled={isSubmitting}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSeatId(seat.id)}
                        disabled={isSubmitting}
                        className="hover:border-transparent hover:bg-primary hover:text-white"
                      >
                        <UserRoundPlus className="h-4 w-4" />
                        Assign
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {activeSeatId && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                      {table.seats.find(s => s.id === activeSeatId)?.guest_name 
                        ? 'Edit guest' 
                        : 'Assign guest'} to Seat {table.seats.find(s => s.id === activeSeatId)?.seat_no}
                    </label>
                    <Input
                      id="guestName"
                      placeholder="Enter guest name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!guestName || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveSeatId(null);
                        setGuestName('');
                      }}
                      disabled={isSubmitting}
                      className="w-full hover:text-white hover:border-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}