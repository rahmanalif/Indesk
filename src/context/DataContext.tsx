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

    // Public Share Link
    clinicShareLink: string | null;
    generateShareLink: () => string;
    addPublicBooking: (info: {
        name: string;
        email: string;
        phone: string;
        clinicianName: string;
        date: string;
        time: string;
        sessionType: string;
        duration?: number;
        invoiceNumber?: string;
    }) => void;
}

function formatDateForStorage(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(baseDate: Date, days: number, hour = 12, minute = 0) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + days);
    nextDate.setHours(hour, minute, 0, 0);
    return nextDate;
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
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [clinicShareLink, setClinicShareLink] = useState<string | null>(() => {
        return localStorage.getItem('clinic_share_link');
    });

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

    const generateShareLink = () => {
        const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        setClinicShareLink(token);
        localStorage.setItem('clinic_share_link', token);
        return token;
    };

    const addPublicBooking = (info: {
        name: string;
        email: string;
        phone: string;
        clinicianName: string;
        date: string;
        time: string;
        sessionType: string;
        duration?: number;
        invoiceNumber?: string;
    }) => {
        const newClientId = Math.max(...clients.map(c => c.id), 0) + 1;
        const newClient: Client = {
            id: newClientId,
            name: info.name,
            email: info.email,
            phone: info.phone,
            address: 'Not provided',
            status: 'Active',
            nextApt: `${info.date}, ${info.time}`,
            clinician: info.clinicianName,
            gpName: '-',
            insurance: '-',
        };
        setClients(prev => [...prev, newClient]);

        const newApt = {
            clientName: info.name,
            clientId: newClientId,
            clinician: info.clinicianName,
            date: info.date,
            time: info.time,
            duration: info.duration || 50,
            type: info.sessionType,
            status: 'pending' as const,
            color: 'bg-blue-100 border-blue-200 text-blue-700',
            notes: `Booked via public portal.${info.invoiceNumber ? ` Invoice: ${info.invoiceNumber}` : ''}`,
        };
        setAppointments(prev => [...prev, { ...newApt, id: Math.max(...prev.map(a => a.id), 0) + 1 }]);
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
            deleteSessionType,
            clinicShareLink,
            generateShareLink,
            addPublicBooking,
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
