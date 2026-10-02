import { Incident, SavedPlace, TowingService } from '../types/traffic';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    road: 'CTE (City-bound)',
    roadFullName: 'CTE (Central Expressway)',
    direction: 'Southbound towards City',
    type: 'Accident in Lane 1 & 2',
    severity: 'CRITICAL',
    reportedTime: '18:31 SGT',
    timeAgo: '11m ago',
    sensorId: '#CTE-SB-14.2',
    currentSpeed: 14,
    normalSpeed: 70,
    delayMinutes: 25,
    officialAdvisory: 'Expect delays of up to 25 mins between AMK Ave 1 and Braddell Flyover; take Thomson Rd if heading to Marina Bay.',
    cameraName: 'Cam 1704',
    cameraLocation: 'Braddell Flyover',
    cameraImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9',
    coordinates: { x: 522, y: 305, lat: 1.3431, lng: 103.8568 },
    icon: 'car_crash',
    category: 'accident'
  },
  {
    id: 'inc-2',
    road: 'PIE (Eastbound)',
    roadFullName: 'PIE (Pan Island Expressway)',
    direction: 'Eastbound towards Changi',
    type: 'Slow traffic due to stalled vehicle',
    severity: 'MODERATE',
    reportedTime: '18:38 SGT',
    timeAgo: '4m ago',
    sensorId: '#PIE-EB-21.6',
    currentSpeed: 42,
    normalSpeed: 80,
    delayMinutes: 6,
    officialAdvisory: 'Stalled vehicle on shoulder near Woodsville Flyover; passing traffic flowing with moderate slow down.',
    cameraName: 'Cam 2108',
    cameraLocation: 'Woodsville Flyover',
    cameraImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9',
    coordinates: { x: 485, y: 332, lat: 1.325, lng: 103.865 },
    icon: 'warning',
    category: 'congestion'
  },
  {
    id: 'inc-3',
    road: 'AYE (Westbound)',
    roadFullName: 'AYE (Ayer Rajah Expressway)',
    direction: 'Westbound towards Tuas',
    type: 'Collision on Lane 2',
    severity: 'HEAVY',
    reportedTime: '18:24 SGT',
    timeAgo: '18m ago',
    sensorId: '#AYE-WB-08.4',
    currentSpeed: 22,
    normalSpeed: 70,
    delayMinutes: 11,
    officialAdvisory: 'Multi-vehicle collision near Clementi Ave 6 Exit; EMAS recovery vehicle in attendance.',
    cameraName: 'Cam 1302',
    cameraLocation: 'Clementi Ave 6 Exit',
    cameraImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9',
    coordinates: { x: 310, y: 433, lat: 1.315, lng: 103.765 },
    icon: 'minor_crash',
    category: 'accident'
  }
];

export const INITIAL_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place-1',
    name: 'Home (Tampines)',
    corridor: 'PIE corridor',
    icon: 'home',
    enabled: true,
    timeWindows: {
      morning: '07:00 – 08:30',
      evening: '18:00 – 19:30',
      frequency: 'Mon – Fri',
      threshold: '> 15 mins'
    }
  },
  {
    id: 'place-2',
    name: 'Work (One-North)',
    corridor: 'AYE corridor',
    icon: 'business_center',
    enabled: true,
    timeWindows: {
      morning: '07:30 – 09:00',
      evening: '17:30 – 19:30',
      frequency: 'Mon – Fri',
      threshold: '> 10 mins'
    }
  },
  {
    id: 'place-3',
    name: 'School (Bukit Timah)',
    corridor: 'BKE/PIE corridor',
    icon: 'school',
    enabled: false,
    timeWindows: {
      morning: '06:45 – 08:00',
      evening: '15:30 – 17:00',
      frequency: 'Mon – Fri',
      threshold: '> 10 mins'
    }
  },
  {
    id: 'place-4',
    name: 'Gym (Marina Bay)',
    corridor: 'ECP corridor',
    icon: 'fitness_center',
    enabled: true,
    timeWindows: {
      morning: '06:30 – 07:30',
      evening: '19:00 – 21:00',
      frequency: 'Tue, Thu, Sat',
      threshold: '> 15 mins'
    }
  }
];

export const TOWING_SERVICES: TowingService[] = [
  {
    id: 'towing-1',
    name: 'AAS Roadside Assist',
    distance: '1.8 km away',
    phone: '67489911',
    displayPhone: '6748 9911',
    type: 'Automobile Association Official 24/7'
  },
  {
    id: 'towing-2',
    name: 'Islandwide 24/7 Towing',
    distance: '3.4 km away',
    phone: '91234567',
    displayPhone: '9123 4567',
    type: 'Heavy Flatbed & Multi-Vehicle Recovery'
  },
  {
    id: 'towing-3',
    name: 'ComfortDelGro Assistance',
    distance: '4.1 km away',
    phone: '65531111',
    displayPhone: '6553 1111',
    type: 'Fleet Recovery & On-Site Battery/Tire'
  }
];

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WEGShzgneoineIDtNRu9ybwu2ZLlqVDkeBd39MBGAZVV8oaOtWQslxCGzY1taj2STh2gvNPn2vsxrtC9ZCWbNugYil9ZG_CiUi4a8-Jh6NwFbhV0f5uEvSN3kXn2pdOWGaNTXtPqvvUe7-BfrHlAjdraVcyRTvcGXfu0zxcf0m8IKdGM1O2kstcW0H4Jfh51iOJnbQ1pIKpfTKB5Ipxc33whDVP_SYrTsaCsxjcLXEgWas7TtPq1PDve4';

export const HELP_MAP_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO12oidUGGo0LDpRRC3G7K7IF32sau_i23sthnNcKMjgkLyVQAtgpEhbaLtq544poghJ5Um0dqa4bhCpVTyODmf4xw8SMRP5h9QwQ62YZ0r6HCT9wkmypGTBTtLF4JAYCgta9Blucehmlg3QFpO77kQ9j4d8V81FhEZX95ZJUyKSH46SLgV_e0lk4lHXOBQfJERB8vBPl1GZcIFVpie64vMmZ8IzGWZ2P1q6I1Uf2RptImfTa4LCYA';
