export interface Seat {
  id: string;
  seat_no: string;
  guest_name: string | null;
  status: 'present' | 'absent';
}

export interface Table {
  id: string;
  label: string;
  seats: Seat[];
}

export type FilterType = 'all' | 'available' | 'taken';
export type ViewMode = 'grid' | 'list';