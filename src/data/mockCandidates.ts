import { Gender, GenderInterest, RelationshipType, Zodiac } from 'constants/enum';
import { MatchPreferences, UserProfile } from 'types/user';

export interface Candidate {
  id: string;
  displayName: string;
  age: number;
  gender: Gender;
  photos: string[];
  distance: number;
  zodiac: Zodiac;
  interests: string[];
  bio: string;
  relationshipType: RelationshipType;
}

const NAMES_FEMALE = [
  'Linh', 'Trang', 'Ngoc', 'Thao', 'Mai', 'Huong', 'Lan', 'Phuong', 'Ha', 'Yen',
  'Thanh', 'Nhi', 'Khanh', 'Uyen', 'Hoa', 'Trinh', 'Vy', 'Quyen', 'Diem', 'Anh',
  'My', 'Ngan', 'Suong', 'Duyen', 'Tam', 'Nhung', 'Chi', 'Truc', 'Bich', 'Dao',
];
const NAMES_MALE = [
  'Minh', 'Duc', 'Hieu', 'Long', 'Tuan', 'Nam', 'Khoa', 'Dat', 'Hung', 'Phuc',
  'Bao', 'Kien', 'Thanh', 'Quang', 'Son', 'Tai', 'Vinh', 'Duy', 'Trung', 'Huy',
  'Tan', 'Thinh', 'An', 'Lam', 'Phong', 'Hoang', 'Tien', 'Cuong', 'Hai', 'Vu',
];
const BIOS = [
  'Love coffee and sunsets',
  'Looking for someone to explore with',
  'Dog lover. Gym addict.',
  'Music is my therapy',
  'Foodie. Travel. Repeat.',
  'Just here to vibe',
  'Adventure awaits',
  'Simple life, big dreams',
  'Bookworm and proud of it',
  'Living my best life',
  'Netflix, chill, repeat',
  'Swipe right if you like pho',
  'Weekend warrior',
  'Cat person pretending to like dogs',
  'Professional overthinker',
  'Recovering workaholic',
  'Your next bad decision',
  'Fluent in sarcasm',
  'Just moved here, show me around?',
  'Looking for my plus-one',
];
const INTERESTS_POOL = [
  'Lien Quan', 'Valorant', 'V-Pop', 'K-Pop', 'Rock', 'EDM',
  'Bong da', 'Gym / Fitness', 'Yoga', 'Chay bo',
  'Cho', 'Meo', 'Cafe', 'Tra sua',
  'Bien / Dao', 'Nui / Trekking', 'Road trip',
];
const ZODIACS = Object.values(Zodiac);
const RELATIONSHIP_TYPES = Object.values(RelationshipType);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateCandidate(index: number): Candidate {
  const gender = index % 2 === 0 ? Gender.Female : Gender.Male;
  const names = gender === Gender.Female ? NAMES_FEMALE : NAMES_MALE;
  const name = names[index % names.length];
  const age = 18 + Math.floor(Math.random() * 17); // 18-34
  const photoCount = 2 + Math.floor(Math.random() * 3); // 2-4
  const photos = Array.from({ length: photoCount }, (_, j) =>
    `https://i.pravatar.cc/600?img=${(index * 4 + j) % 70 + 1}`,
  );

  return {
    id: `candidate-${index}`,
    displayName: name,
    age,
    gender,
    photos,
    distance: 1 + Math.floor(Math.random() * 49), // 1-50km
    zodiac: pick(ZODIACS),
    interests: pickN(INTERESTS_POOL, 3 + Math.floor(Math.random() * 4)),
    bio: pick(BIOS),
    relationshipType: pick(RELATIONSHIP_TYPES),
  };
}

export const ALL_CANDIDATES: Candidate[] = Array.from({ length: 60 }, (_, i) => generateCandidate(i));

export function getCandidates(
  prefs: MatchPreferences | undefined,
  userProfile: UserProfile | undefined,
  iLiked: string[],
  iPassed: string[],
): Candidate[] {
  const seen = new Set([...iLiked, ...iPassed]);
  return ALL_CANDIDATES.filter((c) => {
    if (seen.has(c.id)) return false;
    if (!prefs) return true;

    // Gender filter
    if (prefs.lookingFor !== GenderInterest.Everyone) {
      const wantGender = prefs.lookingFor === GenderInterest.Male ? Gender.Male : Gender.Female;
      if (c.gender !== wantGender) return false;
    }

    // Age filter
    if (c.age < prefs.ageMin || c.age > prefs.ageMax) return false;

    // Distance filter
    if (c.distance > prefs.maxDistanceKm) return false;

    // Relationship type filter
    if (c.relationshipType !== prefs.relationshipType) return false;

    return true;
  });
}
