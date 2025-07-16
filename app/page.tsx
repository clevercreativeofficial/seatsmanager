// File: app/dashboard/page.tsx
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, LayoutGrid, List, LogOut, Armchair, Code, RotateCcw, Trash2, UserRoundPlus, Check, X, Search, Edit2 } from 'lucide-react';
import Container from '@/components/container';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface Seat {
  id: string;
  seat_no: string;
  guest_name: string | null;
  is_present: boolean;
}

interface Table {
  id: string;
  label: string;
  seats: Seat[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'available' | 'taken'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('viewMode') as 'grid' | 'list' || 'grid';
    }
    return 'grid';
  });
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState<'remove' | ''>('');
  const [seatToAction, setSeatToAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tablesPerPage = 24;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    fetchTables();
  }, [router]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('id, label, seats(id, seat_no, guest_name, is_present)')
        .order('label', { ascending: true });

      if (error) throw error;

      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = useMemo(() => {
    let result = tables.filter((table) => {
      const filled = table.seats.filter((s) => s.guest_name !== null).length;
      if (filter === 'available') return filled < 8;
      if (filter === 'taken') return filled === 8;
      return true;
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(table =>
        table.seats.some(seat =>
          seat.guest_name && seat.guest_name.toLowerCase().includes(query)
        )
      );
    }

    return result;
  }, [filter, tables, searchQuery]);

  const paginatedTables = useMemo(() => {
    const startIndex = (currentPage - 1) * tablesPerPage;
    return filteredTables.slice(startIndex, startIndex + tablesPerPage);
  }, [filteredTables, currentPage]);

  const totalPages = Math.ceil(filteredTables.length / tablesPerPage);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.replace('/login');
  };

  const openManageModal = (table: Table) => {
    setSelectedTable(table);
    setActiveSeatId(null);
    setGuestName('');
  };

  const addOrEditGuest = async () => {
    if (!selectedTable || !activeSeatId || !guestName) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seats')
        .update({
          guest_name: guestName,
          is_present: false // Changed from true to false
        })
        .eq('id', activeSeatId);

      if (error) throw error;

      await fetchTables();
      setActiveSeatId(null);
      setGuestName('');
      setSelectedTable(null); // Add this line to close the modal
    } catch (error) {
      console.error('Error assigning guest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGuestPresence = async (seatId: string, currentStatus: boolean) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seats')
        .update({ is_present: !currentStatus })
        .eq('id', seatId);

      if (error) throw error;

      await fetchTables();
      setSelectedTable(null); // Add this line to close the modal after toggling
    } catch (error) {
      console.error('Error toggling presence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleConfirmAction = () => {
    if (actionType === 'remove' && seatToAction) {
      removeGuest(seatToAction);
    }
    setShowConfirmation(false);
  };

  const removeGuest = async (seatId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seats')
        .update({
          guest_name: null,
          is_present: false
        })
        .eq('id', seatId);

      if (error) throw error;

      await fetchTables();
      setSelectedTable(null);
    } catch (error) {
      console.error('Error removing guest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];

    const query = searchQuery.toLowerCase();
    const results: { table: Table, seat: Seat }[] = [];

    tables.forEach(table => {
      table.seats.forEach(seat => {
        if (seat.guest_name && seat.guest_name.toLowerCase().includes(query)) {
          results.push({ table, seat });
        }
      });
    });

    return results;
  }, [searchQuery, tables]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white shadow-sm z-50">
          <Container>
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-rose-100 p-2 rounded-lg">
                  <Armchair className="h-5 w-5 text-rose-600" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md bg-gray-300" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 sm:w-24 w-8 rounded-md bg-gray-300" />
                <Skeleton className="h-8 sm:w-24 w-8 rounded-md bg-accent/20" />
              </div>
            </div>
          </Container>
        </header>
        <Container>
          <div className="py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="sm:translate-y-0 translate-y-8 sm:pb-0 pb-4 sm:mb-0 mb-4">
                <Skeleton className="h-8 w-48 mb-2 bg-gray-300" />
                <Skeleton className="h-4 w-64 bg-gray-300" />
              </div>
              <div className="sm:flex hidden items-center gap-2">
                <Skeleton className="h-8 w-32 bg-gray-300" />
                <Skeleton className="h-8 w-32 bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded-md bg-gray-300" />
                  <Skeleton className="h-8 w-8 rounded-md bg-gray-300" />
                </div>
              </div>

              {/* Mobile */}
              <div className="fixed top-18 left-0 w-full flex sm:hidden justify-between gap-2 pt-4 pb-2 px-4 bg-zinc-50 z-40">
                <Skeleton className="h-8 w-32 bg-gray-300" />
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-md bg-gray-300" />
                  <Skeleton className="h-8 w-8 rounded-md bg-gray-300" />
                </div>
              </div>
            </div>

            {/* Skeleton for both view modes */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(24)].map((_, i) => (
                  <Card key={i} className="border-gray-200">
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-24 bg-gray-300" />
                      <Skeleton className="h-4 w-full bg-gray-300" />
                      <Skeleton className="h-2 w-full bg-gray-300" />
                      <Skeleton className="h-9 w-full bg-gray-300" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-gray-200">
                <div className="p-4 space-y-4">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-24 bg-gray-300" />
                      <Skeleton className="h-4 w-20 bg-gray-300" />
                      <Skeleton className="h-4 w-32 bg-gray-300" />
                      <Skeleton className="h-8 w-20 bg-gray-300" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Table Management Modal */}
      <Dialog open={!!selectedTable} onOpenChange={() => !isSubmitting && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedTable && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Armchair className="h-5 w-5 text-rose-600" />
                  Manage {selectedTable.label}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Confirmation message for delete/unassign */}
                {showConfirmation && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Are you sure you want to remove the guest?
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setShowConfirmation(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleConfirmAction}
                        disabled={isSubmitting}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {/* Seats list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {selectedTable.seats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium flex items-center gap-1 text-gray-900">
                          <Armchair className="h-4 w-4" />
                          Seat {seat.seat_no}
                        </p>
                        <p className="text-sm text-gray-500">
                          {seat.guest_name || <span className="text-gray-400">Unassigned</span>}
                          {seat.guest_name && (seat.is_present ?
                            <span className="text-xs text-green-600"> · Present</span> :
                            <span className="text-xs text-rose-600"> · Absent</span>
                          )}
                        </p>
                      </div>
                      {seat.guest_name ? (
                        <div className="flex gap-2">
                          <Button
                            variant={seat.is_present ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleGuestPresence(seat.id, seat.is_present)}
                            disabled={isSubmitting}
                            className="h-8 px-2"
                          >
                            {seat.is_present ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveSeatId(seat.id);
                              setGuestName(seat.guest_name || '');
                            }}
                            disabled={isSubmitting}
                            className="h-8 px-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSeatToAction(seat.id);
                              setActionType('remove');
                              setShowConfirmation(true);
                            }}
                            disabled={isSubmitting}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
                          Add
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Guest assignment form */}
                {activeSeatId && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedTable.seats.find(s => s.id === activeSeatId)?.guest_name ? 'Edit guest' : 'Add guest'} to Seat {selectedTable.seats.find(s => s.id === activeSeatId)?.seat_no}
                      </label>
                      <Input
                        id="guestName"
                        placeholder="Enter guest name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        disabled={isSubmitting}
                        className='text-sm'
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={addOrEditGuest}
                        disabled={!guestName || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
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

      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <Container>
          <div className="py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Armchair className="h-5 w-5 text-rose-600" />
              </div>
              <h1 className="sm:block hidden md:text-2xl text-xl font-bold text-gray-800">WSM</h1>
              {/* Search */}
              <div className="flex sm:hidden gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search guests..."
                    className="pl-10 w-[180px] text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-10 w-[280px] bg-white shadow-lg rounded-md border border-gray-200">
                    <div className="p-2 text-xs text-gray-500 border-b">Found {searchResults.length} guests</div>
                    {searchResults.map(({ table, seat }) => (
                      <div key={seat.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b" onClick={() => {
                        openManageModal(table);
                        setSearchQuery('');
                      }}>
                        <div className="font-medium">{seat.guest_name}</div>
                        <div className="text-sm text-gray-500">Table {table.label}, Seat {seat.seat_no}</div>
                        <div className={`text-xs mt-1 ${seat.is_present ? 'text-green-600' : 'text-rose-600'}`}>
                          {seat.is_present ? 'Present' : 'Absent'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/about">
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                  <Code className="h-5 w-5" />
                  <span className="sm:inline-block hidden">Dev.</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="sm:inline-block hidden">Logout</span>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container>
        <main className="py-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className='sm:translate-y-0 translate-y-12 sm:pb-0 pb-4'>
              <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
              <p className="text-sm text-gray-600">
                {filteredTables.length} {filteredTables.length === 1 ? 'table' : 'tables'} found ·{' '}
                {filteredTables.reduce((acc, table) => acc + table.seats.filter(s => s.guest_name !== null).length, 0)} guests seated
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="sm:flex hidden gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search guests..."
                    className="pl-10 w-[180px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-10 w-[280px] bg-white shadow-lg rounded-md border border-gray-200">
                    <div className="p-2 text-xs text-gray-500 border-b">Found {searchResults.length} guests</div>
                    {searchResults.map(({ table, seat }) => (
                      <div key={seat.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b" onClick={() => {
                        openManageModal(table);
                        setSearchQuery('');
                      }}>
                        <div className="font-medium">{seat.guest_name}</div>
                        <div className="text-sm text-gray-500">Table {table.label}, Seat {seat.seat_no}</div>
                        <div className={`text-xs mt-1 ${seat.is_present ? 'text-green-600' : 'text-rose-600'}`}>
                          {seat.is_present ? 'Present' : 'Absent'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:flex hidden gap-2">
                <Select
                  value={filter}
                  onValueChange={(value) => {
                    setFilter(value as typeof filter);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    <SelectItem value="available">Available Tables</SelectItem>
                    <SelectItem value="taken">Fully Seated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile */}
              <div className="fixed top-16 left-0 w-full flex sm:hidden justify-between gap-2 pt-4 pb-2 px-4 bg-zinc-50 z-40">
                <Select
                  value={filter}
                  onValueChange={(value) => {
                    setFilter(value as typeof filter);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    <SelectItem value="available">Available Tables</SelectItem>
                    <SelectItem value="taken">Fully Seated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              {paginatedTables.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {paginatedTables.map((table) => {
                    const filled = table.seats.filter((s) => s.guest_name !== null).length;
                    const fillPercentage = (filled / 8) * 100;
                    const statusColor = fillPercentage >= 100 ? 'bg-green-500' :
                      fillPercentage >= 50 ? 'bg-blue-500' : 'bg-rose-500';

                    return (
                      <Card
                        key={table.id}
                        className="hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-800">{table.label}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${filled === 8 ? 'bg-green-100 text-green-800' :
                              filled === 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {filled}/8
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${statusColor}`}
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-right">
                              {filled} {filled === 1 ? 'seat' : 'seats'} occupied
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full hover:bg-gray-900 hover:border-transparent hover:text-white transition-colors"
                            onClick={() => openManageModal(table)}
                          >
                            <Armchair className="mr-1 h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Armchair className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No tables match your current filters</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilter('all');
                      setCurrentPage(1);
                    }}
                    className="hover:border-transparent hover:text-white"
                  >
                    <RotateCcw />
                    Reset filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <>
              {paginatedTables.length > 0 ? (
                <Card className="overflow-hidden px-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Table</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTables.map((table) => {
                        const filled = table.seats.filter((s) => s.guest_name !== null).length;
                        return (
                          <TableRow key={table.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{table.label}</TableCell>
                            <TableCell>
                              {filled === 8 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Complete
                                </span>
                              ) : filled === 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                  Empty
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  In Progress
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${filled === 8 ? 'bg-green-500' :
                                      filled >= 4 ? 'bg-blue-500' : 'bg-rose-500'
                                      }`}
                                    style={{ width: `${(filled / 8) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{filled}/8</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openManageModal(table)}
                                className="hover:bg-gray-900 hover:border-transparent hover:text-white"
                              >
                                <Armchair className="mr-1 h-4 w-4" />
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Armchair className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No tables match your current filters</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilter('all');
                      setCurrentPage(1);
                    }}
                    className="hover:border-transparent hover:text-white"
                  >
                    <RotateCcw />
                    Reset filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {filteredTables.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1 hover:bg-gray-900 hover:border-transparent hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1 hover:bg-gray-900 hover:border-transparent hover:text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </Container>
    </div>
  );
}