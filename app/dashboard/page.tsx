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
import { ChevronLeft, ChevronRight, LayoutGrid, List, LogOut, Armchair, Info } from 'lucide-react';
import Container from '@/components/container';
import Link from 'next/link';

interface Seat {
    id: string;
    seat_no: string;
    guest_name: string | null;
}

interface Table {
    id: string;
    label: string;
    seats: Seat[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'available' | 'taken'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
    const [guestName, setGuestName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const tablesPerPage = 24;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
        if (!isLoggedIn) {
            router.replace('/');
            return;
        }
        fetchTables();
    }, [router]);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tables')
                .select('id, label, seats(id, seat_no, guest_name)')
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
        return tables.filter((table) => {
            const filled = table.seats.filter((s) => s.guest_name !== null).length;
            if (filter === 'available') return filled < 8;
            if (filter === 'taken') return filled === 8;
            return true;
        });
    }, [filter, tables]);

    const paginatedTables = useMemo(() => {
        const startIndex = (currentPage - 1) * tablesPerPage;
        return filteredTables.slice(startIndex, startIndex + tablesPerPage);
    }, [filteredTables, currentPage]);

    const totalPages = Math.ceil(filteredTables.length / tablesPerPage);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        router.replace('/');
    };

    const openManageModal = (table: Table) => {
        setSelectedTable(table);
        setActiveSeatId(null);
        setGuestName('');
    };

    // Update the assignGuest function
    const assignGuest = async () => {
        if (!selectedTable || !activeSeatId || !guestName) return;

        try {
            const { error } = await supabase
                .from('seats')
                .update({ guest_name: guestName })
                .eq('id', activeSeatId);

            if (error) throw error;

            // Refresh the data and close modal
            await fetchTables();
            setSelectedTable(null);
        } catch (error) {
            console.error('Error assigning guest:', error);
        }
    };

    // Update the removeGuest function
    const removeGuest = async (seatId: string) => {
        try {
            const { error } = await supabase
                .from('seats')
                .update({ guest_name: null })
                .eq('id', seatId);

            if (error) throw error;

            // Refresh the data and close modal
            await fetchTables();
            setSelectedTable(null);
        } catch (error) {
            console.error('Error removing guest:', error);
        }
    };

    if (loading) {
        return (
            <div id="loader" className="fixed top-0 left-0 w-full h-full bg-white z-[100]">
                <div className="flex flex-col justify-center items-center gap-4 h-full">
                    <div
                        className="animate-spin rounded-full h-20 w-20 flex justify-center items-center border-b-2 border-r-2 border-accent">
                        <div
                            className="animate-spin rounded-full h-16 w-16 flex justify-center items-center border-b-2 border-r-2 border-zinc-700">
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Modal */}
            <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
                <DialogContent className="max-w-lg">
                    {selectedTable && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Manage {selectedTable.label}</DialogTitle>
                            </DialogHeader>
                            <ul className="mt-4 space-y-2">
                                {selectedTable.seats.map((seat) => (
                                    <li key={seat.id} className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{seat.seat_no}</span>
                                        <span className="text-sm">{seat.guest_name || 'Empty'}</span>
                                        {seat.guest_name ? (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeGuest(seat.id)}
                                            >
                                                Remove
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveSeatId(seat.id)}
                                            >
                                                Assign
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {activeSeatId && (
                                <div className="mt-6 space-y-2">
                                    <Input
                                        placeholder="Guest name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                    <Button onClick={assignGuest} disabled={!guestName}>
                                        Assign to {selectedTable.seats.find(s => s.id === activeSeatId)?.seat_no}
                                    </Button>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setSelectedTable(null)}>Close</Button>
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
                                <Armchair className="h-6 w-6 text-rose-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">WSM</h1>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                            <Link href="/about">
                                <Button
                                    variant="ghost"
                                    className="hover:bg-rose-50"
                                >
                                    <Info className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </header>

            {/* Main Content */}
            <Container>
                <main className="py-8">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
                            <p className="text-gray-600">
                                {filteredTables.length} tables found ({filteredTables.reduce((acc, table) =>
                                    acc + table.seats.filter(s => s.guest_name !== null).length, 0)} guests seated)
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Select value={filter} onValueChange={(value) => {
                                setFilter(value as typeof filter);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter tables" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tables</SelectItem>
                                    <SelectItem value="available">Available Tables</SelectItem>
                                    <SelectItem value="taken">Fully Seated Tables</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                onClick={() => setViewMode('grid')}
                                size="icon"
                                className='hover:text-white hover:border-transparent'
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                onClick={() => setViewMode('list')}
                                size="icon"
                                className='hover:text-white hover:border-transparent'
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {paginatedTables.map((table) => {
                                    const filled = table.seats.filter((s) => s.guest_name !== null).length;
                                    const fillPercentage = (filled / 8) * 100;

                                    return (
                                        <Card key={table.id} className="hover:shadow-md transition-shadow">
                                            <div className="p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{table.label}</h3>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {filled}/8
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${fillPercentage >= 100 ? 'bg-green-500' :
                                                            fillPercentage >= 50 ? 'bg-blue-500' : 'bg-rose-500'
                                                            }`}
                                                        style={{ width: `${fillPercentage}%` }}
                                                    ></div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2 hover:text-white hover:border-transparent"
                                                    onClick={() => openManageModal(table)}
                                                >
                                                    Manage Table
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {paginatedTables.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No tables match your current filters</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Seats</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTables.map((table) => {
                                        const filled = table.seats.filter((s) => s.guest_name !== null).length;
                                        return (
                                            <TableRow key={table.id}>
                                                <TableCell className="font-medium">{table.label}</TableCell>
                                                <TableCell>{filled}/8 seated</TableCell>
                                                <TableCell>
                                                    {filled === 8 ? (
                                                        <span className="text-green-600">Complete</span>
                                                    ) : filled === 0 ? (
                                                        <span className="text-rose-600">Empty</span>
                                                    ) : (
                                                        <span className="text-blue-600">In Progress</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        className='hover:text-white hover:border-transparent'
                                                        size="sm"
                                                        onClick={() => openManageModal(table)}
                                                    >
                                                        Manage
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    )}

                    {/* Pagination */}
                    {filteredTables.length > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className='hover:text-white hover:border-transparent'
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className='hover:text-white hover:border-transparent'
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </main>
            </Container>
        </div>
    );
}