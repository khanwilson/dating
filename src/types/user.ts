import { Gender, GenderInterest, RelationshipType, Zodiac } from 'constants/enum';

export interface Photo {
  id: string;
  uri: string;
  order: number;
}

export interface InterestAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface InterestQuestion {
  id: string;
  title: string;
  options: string[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  phoneCode: string;
  phoneNumber: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  zodiac: Zodiac;
  gender: Gender;
  photos: Photo[];
  interests: InterestAnswer[];
  bio?: string;
  relationshipType?: RelationshipType;
  completed: boolean;
}

export interface MatchPreferences {
  lookingFor: GenderInterest;
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipType: RelationshipType;
}
