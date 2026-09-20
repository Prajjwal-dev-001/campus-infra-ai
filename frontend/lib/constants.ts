/**
 * LPU RMS AI Maintenance System Constants
 * Lovely Professional University, Phagwara, Punjab
 */

export interface LocationItem {
  id: string;
  name: string;
  type: "BOYS_HOSTEL" | "GIRLS_HOSTEL" | "CSE_ACADEMIC" | "MEDICAL";
  description: string;
}

export const LOCATIONS: LocationItem[] = [
  // Boys Hostels
  { id: "BH-1", name: "BH-1", type: "BOYS_HOSTEL", description: "Boys Hostel 1" },
  { id: "BH-2", name: "BH-2", type: "BOYS_HOSTEL", description: "Boys Hostel 2" },
  { id: "BH-3", name: "BH-3", type: "BOYS_HOSTEL", description: "Boys Hostel 3" },
  { id: "BH-4", name: "BH-4", type: "BOYS_HOSTEL", description: "Boys Hostel 4" },
  { id: "BH-5", name: "BH-5", type: "BOYS_HOSTEL", description: "Boys Hostel 5 (Mega Hostel)" },

  // Girls Hostels
  { id: "GH-1", name: "GH-1", type: "GIRLS_HOSTEL", description: "Girls Hostel 1" },
  { id: "GH-2", name: "GH-2", type: "GIRLS_HOSTEL", description: "Girls Hostel 2" },
  { id: "GH-3", name: "GH-3", type: "GIRLS_HOSTEL", description: "Girls Hostel 3" },
  { id: "GH-4", name: "GH-4", type: "GIRLS_HOSTEL", description: "Girls Hostel 4" },

  // CSE Academic Blocks
  { id: "Block-25", name: "Block-25", type: "CSE_ACADEMIC", description: "School of Computer Science & Engineering - Block 25" },
  { id: "Block-26", name: "Block-26", type: "CSE_ACADEMIC", description: "School of Computer Science & Engineering - Block 26" },
  { id: "Block-32", name: "Block-32", type: "CSE_ACADEMIC", description: "CSE Central Academic & Lab Complex - Block 32" },
  { id: "Block-33", name: "Block-33", type: "CSE_ACADEMIC", description: "CSE Academic Block 33" },
  { id: "Block-34", name: "Block-34", type: "CSE_ACADEMIC", description: "CSE Advanced Computing Block 34" },
  { id: "Block-38", name: "Block-38", type: "CSE_ACADEMIC", description: "CSE Server & Research Labs - Block 38" },

  // Medical
  { id: "Uni-Hospital", name: "Uni-Hospital", type: "MEDICAL", description: "LPU University Multi-Specialty Hospital & Healthcare Center" },
];

export const LOCATION_GROUPS = [
  { label: "Boys Hostels", type: "BOYS_HOSTEL", items: LOCATIONS.filter((l) => l.type === "BOYS_HOSTEL") },
  { label: "Girls Hostels", type: "GIRLS_HOSTEL", items: LOCATIONS.filter((l) => l.type === "GIRLS_HOSTEL") },
  { label: "CSE Academic Blocks", type: "CSE_ACADEMIC", items: LOCATIONS.filter((l) => l.type === "CSE_ACADEMIC") },
  { label: "Medical Facilities", type: "MEDICAL", items: LOCATIONS.filter((l) => l.type === "MEDICAL") },
];

export interface EquipmentCategory {
  category: string;
  subcategories: string[];
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    category: "HVAC & Air Conditioning",
    subcategories: [
      "Split AC (Daikin 1.5T)",
      "Split AC (Voltas 1.5T)",
      "Split AC (Blue Star 1.5T)",
    ],
  },
  {
    category: "Water & Heating Systems",
    subcategories: [
      "Water Cooler (Voltas Minimagic)",
      "Water Cooler (Blue Star)",
      "Geyser (Racold 25L)",
      "Geyser (Bajaj 15L)",
      "RO Water Purifier (Kent Grand)",
      "RO Water Purifier (Aquaguard Enhance)",
    ],
  },
  {
    category: "Elevators & Vertical Transport",
    subcategories: [
      "KONE Elevator (Model MonoSpace 500)",
      "Otis Elevator (Gen2)",
    ],
  },
  {
    category: "Classroom & Lab AV / Computing",
    subcategories: [
      "Smartboard (Promethean ActivPanel 75\")",
      "Projector (Epson EB-X51)",
      "Projector (BenQ MX550)",
      "Lab Power Distribution Unit",
      "Network Switch (Cisco Catalyst 2960)",
    ],
  },
  {
    category: "Security & Access Control",
    subcategories: [
      "Biometric Scanner (Mantra MFS100)",
      "Biometric Scanner (Suprema BioEntry W2)",
      "CCTV System (Hikvision DS-2CD)",
    ],
  },
  {
    category: "Power Backup & Heavy Utilities",
    subcategories: [
      "UPS System (APC Smart-UPS 3000VA)",
      "Generator (Kirloskar 125kVA)",
      "Generator (Cummins 82.5kVA)",
    ],
  },
];

export const ISSUE_CATEGORIES = [
  {
    id: "electrical",
    label: "Electrical & Lighting",
    description: "Switches, MCB tripping, power points, wiring, lighting, fans",
    icon: "Zap",
  },
  {
    id: "hvac",
    label: "Air Conditioning (AC) & Cooling",
    description: "Cooling failure, unusual noise, remote/PCB error, water leakage",
    icon: "Wind",
  },
  {
    id: "plumbing_water",
    label: "Plumbing, RO & Water Coolers",
    description: "Tap leakage, water temperature, RO filters, drainage choking",
    icon: "Droplets",
  },
  {
    id: "geyser",
    label: "Water Heaters / Geysers",
    description: "No heating, scalding water, electrical tripping, element burnout",
    icon: "Flame",
  },
  {
    id: "lift_elevator",
    label: "Lifts & Elevators",
    description: "Door sensor malfunction, floor leveling issue, alarm buzzer, jerky travel",
    icon: "ArrowUpDown",
  },
  {
    id: "classroom_av",
    label: "Classroom Smartboards & Projectors",
    description: "Lamp burnout, touch calibration, no signal, display flicker",
    icon: "Presentation",
  },
  {
    id: "network_biometric",
    label: "Network, CCTV & Biometrics",
    description: "Turnstile punch failure, switch port down, camera offline, PoE fault",
    icon: "Network",
  },
  {
    id: "power_generator",
    label: "Generators & Critical UPS",
    description: "AMF failover, battery degradation, frequency/voltage drop, oil/diesel leak",
    icon: "BatteryCharging",
  },
];

export const TIME_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
] as const;

export interface MockUserCredential {
  id: string;
  password: string;
  role: "student" | "warden" | "maintenance";
  name: string;
  block?: string;
  room?: string;
  department?: string;
}

export const MOCK_USERS: MockUserCredential[] = [
  {
    id: "12300001",
    password: "student123",
    role: "student",
    name: "Rahul Kumar",
    block: "BH-5",
    room: "A-824",
  },
  {
    id: "FAC001",
    password: "warden123",
    role: "warden",
    name: "Dr. Priya Sharma",
    block: "BH-5",
  },
  {
    id: "FAC002",
    password: "warden123",
    role: "warden",
    name: "Prof. Anil Gupta",
    block: "Block-32",
  },
  {
    id: "FAC003",
    password: "warden123",
    role: "warden",
    name: "Warden Sunita Verma",
    block: "GH-2",
  },
  {
    id: "MAINT001",
    password: "maint123",
    role: "maintenance",
    name: "Suresh Singh",
    department: "Electrical & Civil",
  },
];
