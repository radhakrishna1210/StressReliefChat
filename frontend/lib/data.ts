export interface Listener {
  id: string;
  name: string;
  tagline: string;
  description: string;
  experience: string;
  specialties: string[];
  pricePerMin: number;
  avatar: string;
  rating: number;
  totalCalls: number;
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  description: string;
  credentials: string;
  specialties: string[];
  pricePerMin: number;
  avatar: string;
  rating: number;
  experience: string;
}

export const listeners: Listener[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    tagline: 'Relationship Guru',
    description: 'I\'ve navigated through relationship challenges and found peace. Let\'s talk about love, loss, and everything in between.',
    experience: '5 years supporting others',
    specialties: ['Relationships', 'Breakups', 'Family Issues'],
    pricePerMin: 2,
    avatar: '👩‍🦰',
    rating: 4.9,
    totalCalls: 342,
  },
  {
    id: '2',
    name: 'Sam Patel',
    tagline: 'Workaholic Recovery',
    description: 'Former workaholic who learned balance. I understand burnout, career stress, and the pressure to perform.',
    experience: '8 years in corporate, 3 years helping others',
    specialties: ['Work Stress', 'Burnout', 'Career Transitions'],
    pricePerMin: 2,
    avatar: '👨‍💼',
    rating: 4.8,
    totalCalls: 289,
  },
  {
    id: '3',
    name: 'Anjali Mehta',
    tagline: 'Anxiety Companion',
    description: 'Living with anxiety taught me coping strategies. I\'m here to listen without judgment and share what worked for me.',
    experience: '4 years peer support',
    specialties: ['Anxiety', 'Panic Attacks', 'Social Anxiety'],
    pricePerMin: 2,
    avatar: '👩',
    rating: 4.9,
    totalCalls: 456,
  },
  {
    id: '4',
    name: 'Rahul Kumar',
    tagline: 'Life Transitions Guide',
    description: 'Changed careers, moved cities, started over. I know how overwhelming transitions can be. Let\'s navigate yours together.',
    experience: '6 years peer support',
    specialties: ['Life Changes', 'Moving', 'Career Shifts'],
    pricePerMin: 2,
    avatar: '👨',
    rating: 4.7,
    totalCalls: 198,
  },
  {
    id: '5',
    name: 'Maya Desai',
    tagline: 'Grief & Loss Support',
    description: 'Lost someone close and found my way through grief. I offer a safe space to process loss and find meaning.',
    experience: '7 years supporting others',
    specialties: ['Grief', 'Loss', 'Bereavement'],
    pricePerMin: 2,
    avatar: '👩‍🦱',
    rating: 5.0,
    totalCalls: 523,
  },
];

export const therapists: Therapist[] = [
  {
    id: 't1',
    name: 'Dr. Singh',
    title: 'Licensed Clinical Psychologist',
    description: '15 years of experience in cognitive behavioral therapy and stress management. Specialized in anxiety disorders and trauma.',
    credentials: 'Ph.D. Psychology, Licensed in India',
    specialties: ['CBT', 'Anxiety Disorders', 'Trauma', 'Stress Management'],
    pricePerMin: 5,
    avatar: '👨‍⚕️',
    rating: 5.0,
    experience: '15 years',
  },
  {
    id: 't2',
    name: 'Dr. Nair',
    title: 'Licensed Therapist',
    description: 'Expert in relationship counseling and family therapy. Helps individuals and couples navigate complex emotional landscapes.',
    credentials: 'M.A. Clinical Psychology, Licensed Therapist',
    specialties: ['Relationship Counseling', 'Family Therapy', 'Couples Therapy'],
    pricePerMin: 5,
    avatar: '👩‍⚕️',
    rating: 4.9,
    experience: '12 years',
  },
  {
    id: 't3',
    name: 'Dr. Reddy',
    title: 'Licensed Psychiatrist',
    description: 'Board-certified psychiatrist specializing in mood disorders, depression, and medication management alongside therapy.',
    credentials: 'M.D. Psychiatry, Board Certified',
    specialties: ['Depression', 'Mood Disorders', 'Medication Management'],
    pricePerMin: 5,
    avatar: '👨‍⚕️',
    rating: 4.8,
    experience: '18 years',
  },
];

export const emergencyKeywords = [
  'hurt myself',
  'kill myself',
  'end it',
  'suicide',
  'self harm',
  'want to die',
  'ending my life',
  'not worth living',
];

export const emergencyHotlines = {
  india: '9152987821',
  global: [
    { country: 'USA', number: '988' },
    { country: 'UK', number: '116 123' },
    { country: 'Canada', number: '1-833-456-4566' },
    { country: 'Australia', number: '13 11 14' },
  ],
};

