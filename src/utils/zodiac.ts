import { Zodiac } from 'constants/enum';

// Standard Western astrology date boundaries.
// Each entry: [endMonth, endDay, zodiac] — if month/day <= boundary, return that zodiac.
// Order matters: checked top-down, first match wins.
const BOUNDARIES: [number, number, Zodiac][] = [
  [1, 19, Zodiac.Capricorn],
  [2, 18, Zodiac.Aquarius],
  [3, 20, Zodiac.Pisces],
  [4, 19, Zodiac.Aries],
  [5, 20, Zodiac.Taurus],
  [6, 20, Zodiac.Gemini],
  [7, 22, Zodiac.Cancer],
  [8, 22, Zodiac.Leo],
  [9, 22, Zodiac.Virgo],
  [10, 22, Zodiac.Libra],
  [11, 21, Zodiac.Scorpio],
  [12, 21, Zodiac.Sagittarius],
  [12, 31, Zodiac.Capricorn],
];

export function getZodiacFromBirthDate(date: Date): Zodiac {
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();

  for (const [endMonth, endDay, zodiac] of BOUNDARIES) {
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return zodiac;
    }
  }

  // Fallback (should never reach here with valid dates)
  return Zodiac.Capricorn;
}
