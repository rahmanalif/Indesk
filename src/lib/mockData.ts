export const MOCK_CLIENTS = [
  { id: 1, name: 'James Wilson', email: 'james.w@gmail.com', phone: '+1 (555) 123-4567', address: '123 Wellness Ave, Health City', status: 'Active', nextApt: 'Mar 20, 9:00 AM', clinician: 'Dr. Sarah Smith', gpName: 'Dr. Gregory House', insurance: 'Aetna' },
  { id: 2, name: 'Emma Thompson', email: 'emma.t@yahoo.com', phone: '+1 (555) 987-6543', address: '456 Calm St, Serenity Vile', status: 'Active', nextApt: 'Mar 20, 11:00 AM', clinician: 'Dr. Sarah Smith', gpName: 'Dr. John Watson', insurance: 'Blue Cross' },
  { id: 3, name: 'Michael Brown', email: 'm.brown@outlook.com', phone: '+1 (555) 456-7890', address: '789 Hope Ln, Recovery Town', status: 'Waiting List', nextApt: '-', clinician: 'Unassigned', gpName: 'Dr. Meredith Grey', insurance: 'Cigna' },
  { id: 4, name: 'Lisa Davis', email: 'lisa.d@gmail.com', phone: '+1 (555) 321-6549', address: '101 Peace Blvd, Tranquility City', status: 'Inactive', nextApt: '-', clinician: 'Dr. John Doe', gpName: 'Dr. Lisa Cuddy', insurance: 'UnitedHealth' },
  { id: 5, name: 'Robert Miller', email: 'rob.m@gmail.com', phone: '+1 (555) 789-1234', address: '202 Zen Way, Mindfulness Park', status: 'Active', nextApt: 'Mar 22, 2:00 PM', clinician: 'Dr. Sarah Smith', gpName: 'Dr. James Wilson', insurance: 'Kaiser' },
  { id: 6, name: 'Sarah Connor', email: 'sarah.c@sky.net', phone: '+1 (555) 111-2222', address: '99 Future Rd', status: 'Active', nextApt: 'Mar 23, 10:00 AM', clinician: 'Dr. Kyle Reese', gpName: 'Dr. Silberman', insurance: 'CyberLife' },
  { id: 7, name: 'John Doe', email: 'john.d@anon.com', phone: '+1 (555) 000-0000', address: 'Unknown', status: 'Waiting List', nextApt: '-', clinician: 'Unassigned', gpName: '-', insurance: 'None' },
  { id: 8, name: 'Jane Smith', email: 'jane.s@test.com', phone: '+1 (555) 999-9999', address: '123 Test St', status: 'Active', nextApt: 'Mar 24, 1:00 PM', clinician: 'Dr. Sarah Smith', gpName: '-', insurance: 'Aetna' },
  { id: 9, name: 'Alice Wonderland', email: 'alice@rabbit.hole', phone: '+1 (555) 777-7777', address: '1 Rabbit Hole', status: 'Active', nextApt: 'Mar 25, 3:00 PM', clinician: 'Dr. Hatter', gpName: '-', insurance: 'Blue Cross' },
  { id: 10, name: 'Bob Builder', email: 'bob@build.it', phone: '+1 (555) 222-3333', address: '44 Construction Site', status: 'Inactive', nextApt: '-', clinician: 'Dr. Wendy', gpName: '-', insurance: 'Cigna' },
  { id: 11, name: 'Charlie Brown', email: 'charlie@peanuts.com', phone: '+1 (555) 444-5555', address: '100 Snoopy Ln', status: 'Active', nextApt: 'Mar 26, 9:30 AM', clinician: 'Dr. Lucy', gpName: 'Dr. Linus', insurance: 'UnitedHealth' },
  { id: 12, name: 'Diana Prince', email: 'diana@amazon.com', phone: '+1 (555) 888-8888', address: 'Themyscira', status: 'Active', nextApt: 'Mar 27, 11:00 AM', clinician: 'Dr. Trevor', gpName: '-', insurance: 'Kaiser' },
];

export const MOCK_NOTES = [{
  id: 1,
  clientId: 1,
  date: 'Mar 15, 2024',
  author: 'Dr. Sarah Smith',
  content: 'Patient showing signs of improvement. Continued therapy recommended.',
  type: 'Clinical'
}, {
  id: 2,
  clientId: 1,
  date: 'Mar 01, 2024',
  author: 'Dr. Sarah Smith',
  content: 'Initial Consult. Patient reports anxiety and trouble sleeping.',
  type: 'Clinical'
}];

export const MOCK_CLINIC_DETAILS = {
  name: 'Inkind Wellness Center',
  phone: '+1 (555) 999-8888',
  email: 'contact@inkind.clinic',
  address: '123 Healing Blvd, Suite 100',
  website: 'https://inkind.clinic',
  primaryColor: '#839362',
  accentColor: '#F5F4F1'
};

export const MOCK_CLINICIANS = [{
  id: 1,
  name: 'Dr. Sarah Smith',
  role: 'Lead Clinician',
  email: 'sarah@clinic.com',
  phone: '+1 (555) 111-2222',
  clients: 24,
  status: 'Available',
  specialty: 'Psycology',
  bio: 'Expert in CBT and anxiety disorders.'
}, {
  id: 2,
  name: 'Dr. John Doe',
  role: 'Associate',
  email: 'john@clinic.com',
  phone: '+1 (555) 333-4444',
  clients: 18,
  status: 'In Session',
  specialty: 'Family Therapy',
  bio: 'Specializes in family dynamics and child psychology.'
}, {
  id: 3,
  name: 'Dr. Emily White',
  role: 'Associate',
  email: 'emily@clinic.com',
  phone: '+1 (555) 555-6666',
  clients: 12,
  status: 'Offline',
  specialty: 'Clinical Social Work',
  bio: 'Focuses on community support and resource allocation.'
}];

export const SESSION_TYPES = [{
  id: 1,
  name: 'Initial Consultation',
  duration: '60 min',
  price: '$150',
  color: 'bg-blue-100 text-blue-700',
  reminders: ['Email', 'SMS']
}, {
  id: 2,
  name: 'Standard Therapy',
  duration: '50 min',
  price: '$120',
  color: 'bg-green-100 text-green-700',
  reminders: ['Email']
}, {
  id: 3,
  name: 'Follow-up Check-in',
  duration: '30 min',
  price: '$80',
  color: 'bg-purple-100 text-purple-700',
  reminders: ['Email']
}, {
  id: 4,
  name: 'Group Session',
  duration: '90 min',
  price: '$60',
  color: 'bg-orange-100 text-orange-700',
  reminders: ['Email', 'SMS']
}];

export const PERMISSION_KEYS = [
  { id: 'page_dashboard', label: 'Dashboard', category: 'General' },
  { id: 'page_roles', label: 'Roles & Permissions', category: 'Admin' },
  { id: 'page_ai', label: 'AI Assistance', category: 'Features' },
  { id: 'page_clients', label: 'Clients', category: 'Clinical' },
  { id: 'page_clinic', label: 'Clinic & Clinicians', category: 'Admin' },
  { id: 'page_invoices', label: 'Invoices', category: 'Billing' },
  { id: 'page_sessions', label: 'Sessions', category: 'Clinical' },
  { id: 'page_forms', label: 'Forms', category: 'Clinical' },
  { id: 'page_money', label: 'Money Matters', category: 'Billing' },
  { id: 'page_subscription', label: 'Subscription', category: 'Admin' },
  { id: 'page_integrations', label: 'Integrations', category: 'Admin' }
];

export const GLOBAL_PERMISSIONS: Record<string, string[]> = {
  'Admin': PERMISSION_KEYS.map(p => p.id),
  'Clinician': ['page_dashboard', 'page_clients', 'page_sessions', 'page_forms']
};

export const CLINICIAN_PERMISSIONS: Record<number, string[]> = {
  1: ['page_dashboard', 'page_clients', 'page_sessions', 'page_forms'],
  2: ['page_dashboard', 'page_clients', 'page_sessions']
};
