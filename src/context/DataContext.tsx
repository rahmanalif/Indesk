import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_CLIENTS, GLOBAL_PERMISSIONS as MOCK_GLOBAL_PERMISSIONS, CLINICIAN_PERMISSIONS as MOCK_CLINICIAN_PERMISSIONS, SESSION_TYPES as MOCK_SESSION_TYPES } from '../lib/mockData';

export interface Appointment {
    id: number;
    clientName: string;
    clientId?: number;
    clinician: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    duration: number;
    type: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    color: string;
    notes?: string;
    videoLink?: string;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'Active' | 'Waiting List' | 'Inactive';
    nextApt: string;
    clinician: string;
    gpName: string;
    insurance: string;
}

export interface SessionType {
    id: number;
    name: string;
    duration: string;
    price: string;
    color: string;
    reminders: string[];
}

interface DataContextType {
    currentUser: { id: number; name: string; email: string; role: 'Admin' | 'Clinician' } | null;
    login: (email: string, role: 'Admin' | 'Clinician') => void;
    logout: () => void;

    clients: Client[];
    appointments: Appointment[];
    addClient: (client: Omit<Client, 'id'>) => void;
    addAppointment: (apt: Omit<Appointment, 'id'>) => void;
    updateAppointment: (apt: Appointment) => void;
    deleteAppointment: (id: number) => void;
    getAppointmentsByClient: (clientId: number) => Appointment[];

    // Permissions
    globalPermissions: Record<string, string[]>;
    clinicianOverrides: Record<number, string[]>;
    updateGlobalPermissions: (role: string, permissions: string[]) => void;
    updateClinicianPermissions: (clinicianId: number, permissions: string[]) => void;
    checkAccess: (requiredPermission?: string) => boolean;

    // Branding
    branding: { logo: string | null; color: string };
    updateBranding: (logo: string | null, color: string) => void;

    // Session Types
    sessionTypes: SessionType[];
    addSessionType: (session: Omit<SessionType, 'id'>) => void;
    updateSessionType: (session: SessionType) => void;
    deleteSessionType: (id: number) => void;
}

// Initial Appointments (Syncing with mockup labels where possible)
const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: 1,
        clientName: 'James Wilson',
        clientId: 1,
        clinician: 'Dr. Sarah Smith',
        date: '2025-12-29', // Today based on context
        time: '09:00',
        duration: 50,
        type: 'Therapy Session',
        status: 'confirmed',
        color: 'bg-blue-100 border-blue-200 text-blue-700',
        notes: 'Patient making good progress.',
        videoLink: 'https://zoom.us/j/123456789'
    },
    {
        id: 2,
        clientName: 'Emma Thompson',
        clientId: 2,
        clinician: 'Dr. Sarah Smith',
        date: '2025-12-29',
        time: '11:00',
        duration: 60,
        type: 'Initial Consultation',
        status: 'pending',
        color: 'bg-purple-100 border-purple-200 text-purple-700',
        videoLink: 'https://zoom.us/j/987654321'
    }
];

// Helper to bridge the gap between "Mar 20, 9:00 AM" strings and Calendar dates
// We'll use this to populate the calendar with the "Next Apt" data from mock clients
function seedAppointmentsFromClients(clients: any[]): Appointment[] {
    const list = [...INITIAL_APPOINTMENTS];

    // Add dummy data for other clinicians directly here for the requested demo
    const year = "2025";
    const month = "01"; // Assuming Jan 2025 for demo

    // Dr. John Doe's Appointments (ID 2)
    list.push({
        id: 101, clientId: 101, clientName: 'Robert Baratheon',
        clinician: 'Dr. John Doe', date: `${year}-${month}-02`, time: '10:00', duration: 50,
        type: 'Family Therapy', status: 'confirmed', color: 'bg-green-100 border-green-200 text-green-700'
    });
    list.push({
        id: 102, clientId: 102, clientName: 'Cersei Lannister',
        clinician: 'Dr. John Doe', date: `${year}-${month}-02`, time: '14:00', duration: 90,
        type: 'Couples Counseling', status: 'pending', color: 'bg-orange-100 border-orange-200 text-orange-700'
    });
    list.push({
        id: 103, clientId: 103, clientName: 'Joffrey Baratheon',
        clinician: 'Dr. John Doe', date: `${year}-${month}-03`, time: '09:00', duration: 50,
        type: 'Child Psychology', status: 'confirmed', color: 'bg-blue-100 border-blue-200 text-blue-700'
    });

    // Dr. Emily White's Appointments (ID 3)
    list.push({
        id: 201, clientId: 201, clientName: 'Daenerys Targaryen',
        clinician: 'Dr. Emily White', date: `${year}-${month}-02`, time: '11:00', duration: 60,
        type: 'Standard Therapy', status: 'confirmed', color: 'bg-purple-100 border-purple-200 text-purple-700'
    });
    list.push({
        id: 202, clientId: 202, clientName: 'Jon Snow',
        clinician: 'Dr. Emily White', date: `${year}-${month}-04`, time: '16:00', duration: 50,
        type: 'Follow-up Check-in', status: 'completed', color: 'bg-green-100 border-green-200 text-green-700'
    });

    // Admin's Personal/Test Appointments (ID 999) - To show "Admin has his calendar"
    list.push({
        id: 901, clientId: 901, clientName: 'System Check',
        clinician: 'Admin User', date: `${year}-${month}-05`, time: '09:00', duration: 30,
        type: 'Administrative', status: 'confirmed', color: 'bg-gray-100 border-gray-200 text-gray-700'
    });

    let nextId = 1000;

    clients.forEach(client => {
        // If they have a nextApt string like "Mar 20, 9:00 AM"
        if (client.nextApt && client.nextApt !== '-' && !list.find(a => a.clientId === client.id)) {
            // Very basic parser for the current mock formats
            // Format: "Mar 20, 11:00 AM" or "Mar 24, 1:00 PM"
            // We'll map "Mar" to "2024-03" (assuming 2024 for the mock context or 2025 based on current date)
            const yearVal = "2025";
            const monthMap: any = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

            try {
                const parts = client.nextApt.split(', ');
                const dateParts = parts[0].split(' ');
                const monthVal = monthMap[dateParts[0]] || '03';
                const dayVal = dateParts[1].padStart(2, '0');

                const timeParts = parts[1].split(' ');
                const [rawHours, mins] = timeParts[0].split(':');
                let hours = rawHours;
                const period = timeParts[1]; // AM/PM
                if (period === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
                if (period === 'AM' && hours === '12') hours = '00';
                const timeStr = `${hours.padStart(2, '0')}:${mins}`;

                list.push({
                    id: nextId++,
                    clientName: client.name,
                    clientId: client.id,
                    clinician: client.clinician || 'Dr. Sarah Smith',
                    date: `${yearVal}-${monthVal}-${dayVal}`,
                    time: timeStr,
                    duration: 50,
                    type: 'Standard Therapy',
                    status: 'confirmed',
                    color: 'bg-green-100 border-green-200 text-green-700',
                    videoLink: 'https://zoom.us/j/mock-' + client.id
                });
            } catch (e) {
                // Ignore parsing errors for non-matching formats
            }
        }
    });

    return list;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string; role: 'Admin' | 'Clinician' } | null>(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    // Persist effect
    React.useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const [globalPermissions, setGlobalPermissions] = useState(MOCK_GLOBAL_PERMISSIONS);
    const [clinicianOverrides, setClinicianOverrides] = useState(MOCK_CLINICIAN_PERMISSIONS);

    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS as Client[]);
    const [appointments, setAppointments] = useState<Appointment[]>(seedAppointmentsFromClients(MOCK_CLIENTS));

    const [branding, setBranding] = useState<{ logo: string | null; color: string }>(() => {
        const saved = localStorage.getItem('clinic_branding');
        return saved ? JSON.parse(saved) : { logo: null, color: '#0066FF' };
    });

    const [sessionTypes, setSessionTypes] = useState<SessionType[]>(MOCK_SESSION_TYPES as SessionType[]);

    // Persist branding
    React.useEffect(() => {
        localStorage.setItem('clinic_branding', JSON.stringify(branding));
    }, [branding]);

    const updateBranding = (logo: string | null, color: string) => {
        setBranding({ logo, color });
    };

    const login = (email: string, role: 'Admin' | 'Clinician') => {
        // Mock Login Logic
        if (role === 'Admin') {
            const adminUser = { id: 999, name: 'Admin User', email: email || 'admin@inkind.com', role: 'Admin' };
            setCurrentUser(adminUser as any);
        } else {
            // Updated to use Dr. John Doe (ID 2) as requested for testing
            const clinicianUser = { id: 2, name: 'Dr. John Doe', email: email || 'john@clinic.com', role: 'Clinician' };
            setCurrentUser(clinicianUser as any);
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateGlobalPermissions = (role: string, permissions: string[]) => {
        setGlobalPermissions(prev => ({
            ...prev,
            [role]: permissions
        }));
    };

    const updateClinicianPermissions = (clinicianId: number, permissions: string[]) => {
        setClinicianOverrides(prev => ({
            ...prev,
            [clinicianId]: permissions
        }));
    };

    const checkAccess = (requiredPermission?: string) => {
        if (!currentUser) return false;
        if (currentUser.role === 'Admin') return true;

        if (!requiredPermission) return true;

        // Strictly Global Role Defaults
        const rolePermissions = globalPermissions[currentUser.role];
        return rolePermissions ? rolePermissions.includes(requiredPermission) : false;
    };

    const addClient = (newClient: Omit<Client, 'id'>) => {
        const client = { ...newClient, id: Math.max(...clients.map(c => c.id), 0) + 1 };
        setClients([...clients, client]);
    };

    const addAppointment = (newApt: Omit<Appointment, 'id'>) => {
        const apt = {
            ...newApt,
            id: Math.max(...appointments.map(a => a.id), 0) + 1,
            videoLink: newApt.videoLink || 'https://zoom.us/j/mock-meeting-' + Date.now()
        };
        setAppointments([...appointments, apt as Appointment]);
        updateClientNextApt(apt as Appointment);
    };

    const updateAppointment = (updatedApt: Appointment) => {
        setAppointments(appointments.map(a => a.id === updatedApt.id ? updatedApt : a));
        updateClientNextApt(updatedApt);
    };

    const deleteAppointment = (id: number) => {
        setAppointments(appointments.filter(a => a.id !== id));
    };

    const getAppointmentsByClient = (clientId: number) => {
        return appointments.filter(a => a.clientId === clientId);
    };

    const updateClientNextApt = (apt: Appointment) => {
        if (!apt.clientId) return;
        setClients(prev => prev.map(c => {
            if (c.id === apt.clientId) {
                const dateObj = new Date(apt.date + 'T' + apt.time);
                const start = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                return { ...c, nextApt: `${start}, ${timeStr} ` };
            }
            return c;
        }));
    };

    const addSessionType = (newSession: Omit<SessionType, 'id'>) => {
        const session = { ...newSession, id: Math.max(...sessionTypes.map(s => s.id), 100) + 1 };
        setSessionTypes([...sessionTypes, session as SessionType]);
    };

    const updateSessionType = (updatedSession: SessionType) => {
        setSessionTypes(sessionTypes.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    const deleteSessionType = (id: number) => {
        setSessionTypes(sessionTypes.filter(s => s.id !== id));
    };

    return (
        <DataContext.Provider value={{
            currentUser,
            login,
            logout,
            clients,
            appointments,
            addClient,
            addAppointment,
            updateAppointment,
            deleteAppointment,
            getAppointmentsByClient,
            globalPermissions,
            clinicianOverrides,
            updateGlobalPermissions,
            updateClinicianPermissions,
            checkAccess,
            branding,
            updateBranding,
            sessionTypes,
            addSessionType,
            updateSessionType,
            deleteSessionType
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
