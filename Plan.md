# Plan.md — Dating App (Tinder-style)

> Tài liệu nguồn cho team & cho AI agent. Mỗi task ở mục cuối được thực thi tuần tự bằng `.harness/init.sh <task-id> "<title>"`.

---

## 1. Bối cảnh & mục tiêu

Xây một app hẹn hò mobile (iOS + Android, Expo managed) lấy cảm hứng từ Tinder. Phần signup truyền thống (email/password) bị **thay thế hoàn toàn** bằng một flow **onboarding nhiều bước hỏi thông tin cá nhân**. Người dùng hoàn tất onboarding là vào thẳng app — không có màn signin riêng.

Ràng buộc nền tảng: giữ stack hiện có (Expo Router, React Native 0.81, React 19, TanStack Query, Zustand, axios, i18next, theme). Không thêm framework mới trừ khi task ghi rõ.

---

## 2. Onboarding flow (9 màn)

Mỗi màn **chỉ hỏi 1 ý**. Có header progress (1/9 → 9/9), nút **Back** (trừ màn 1), nút **Next** disabled cho tới khi input hợp lệ. Mỗi bước commit dữ liệu vào `ZustandPersist.userProfile` để chịu được crash/khởi động lại giữa chừng.

| # | Screen | Hỏi gì | Validate | Ghi vào |
|---|---|---|---|---|
| 1 | NameScreen | "Mọi người có thể gọi bạn là gì?" | trim ≥ 1 ký tự, ≤ 30 | `userProfile.displayName` |
| 2 | BirthdayScreen | Ngày tháng năm sinh | tuổi ≥ 18; tự tính & hiển thị **cung hoàng đạo** | `userProfile.birthDate`, `userProfile.zodiac` (derived) |
| 3 | GenderScreen | Giới tính của bạn | chọn 1 trong `Male / Female / NonBinary / PreferNotToSay` | `userProfile.gender` |
| 4 | LookingForScreen | Giới tính bạn muốn tìm hiểu | chọn 1 trong `Male / Female / Everyone` | `matchPreferences.lookingFor` |
| 5 | AgeRangeScreen | Khoảng tuổi muốn kết nối | dual-slider 18..65, min ≤ max | `matchPreferences.ageMin`, `ageMax` |
| 6 | InterestsScreen | Sở thích — chip multi-select theo nhóm câu hỏi | tổng cộng ≥ 3 chip (cross-group) | `userProfile.interests: InterestAnswer[]` |
| 7 | PhotosScreen | Upload ảnh profile | tối thiểu 1, tối đa 6 | `userProfile.photos: Photo[]` |
| 8 | DistanceScreen | Phạm vi xa nhất muốn kết nối | slider 1..200 km | `matchPreferences.maxDistanceKm` |
| 9 | RelationshipTypeScreen | Kiểu mối quan hệ | chọn 1 trong `ShortTerm / LongTerm / Friends` | `matchPreferences.relationshipType` |

Sau màn 9: set `userProfile.completed = true` → `router.replace('/(tabs)')`.

### Catalog câu hỏi chip (Screen 6)

Đặt ở `src/constants/interestQuestions.ts`, dạng:

```ts
[
  { id: 'games',  title: 'Bạn chơi game gì?',          options: ['Liên Quân', 'Valorant', 'LoL', ...] },
  { id: 'music',  title: 'Thể loại nhạc yêu thích?',    options: ['V-Pop', 'K-Pop', 'Rock', 'EDM', ...] },
  { id: 'sports', title: 'Môn thể thao yêu thích?',     options: ['Bóng đá', 'Cầu lông', 'Gym', 'Yoga', ...] },
  { id: 'pets',   title: 'Thú cưng đang nuôi?',         options: ['Chó', 'Mèo', 'Cá', 'Không nuôi', ...] },
  // mở rộng dễ — chỉ thêm phần tử
]
```

### Cung hoàng đạo (Screen 2)

`src/utils/zodiac.ts`: pure function `getZodiacFromBirthDate(date: Date): Zodiac` ánh xạ tháng/ngày → 1 trong 12 cung. Không gọi API.

---

## 3. App tabs (5 tabs sau onboarding)

| Tab | Nội dung | Note |
|---|---|---|
| 1. Swipe | Card stack kiểu Tinder. Lấy ứng viên thoả `matchPreferences` (gender, age range, distance, relationship type, có ≥ 1 sở thích chung). Vuốt phải = like, vuốt trái = pass. Ấn Super Like (tuỳ chọn về sau). | Tab chính, mở app vào đây |
| 2. Discover | Section chia theo badge: theo `relationshipType` (ai cũng đang tìm "long term", "friends"), theo nhóm sở thích nổi bật. Mỗi section là horizontal scroll mini-card. Tap vào → modal profile detail. | |
| 3. Likes | Nested AppTab 2 sub-tab: **"Tôi đã thả tim"** / **"Đã thả tim tôi"**. Grid thumbnail. Sub-tab thứ 2 có thể overlay paywall (visual only ở v1). | |
| 4. Chat | List conversation (avatar, tên, last message, timestamp, unread badge, tick read receipt). Tap → ChatBox với bubble + input. Status: `sending → sent → delivered → read`, có typing indicator. Logic giống Messenger. | Mock messages local trước, wire backend sau |
| 5. Profile | Hồ sơ của chính user (carousel ảnh, tên, tuổi, zodiac, interests, looking for). Edit → chạy lại từng màn onboarding tương ứng. Settings: theme (Dark/Light), language (EN/VI), logout (clear profile → onboarding). | |

---

## 4. Audit code hiện tại

Ký hiệu: **GIỮ** (không sửa), **EXTEND** (giữ + sửa nhỏ), **REPLACE** (viết lại nội dung, file đổi), **REMOVE** (xoá hẳn).

### 4.1 Routes (`app/`)

| File | Quyết định | Lý do |
|---|---|---|
| `app/_layout.tsx` | EXTEND | Đổi route tree: bỏ `OnBoardingScreen` đơn, `SigninStack`, `DetailToDoScreen`; thêm `OnboardingStack`. |
| `app/index.tsx` | EXTEND | Logic splash đổi: thay vì check `hasSeenOnboarding`, check `ZustandPersist.userProfile?.completed`. |
| `app/OnBoardingScreen.tsx` | REMOVE | Demo 3 slide cũ về Three.js, không liên quan. |
| `app/SigninStack/SigninScreen.tsx` | REMOVE | Không có signin riêng. |
| `app/SigninStack/SignupScreen.tsx` | REMOVE | Onboarding thay thế signup. |
| `app/SigninStack/_layout.tsx` | REMOVE | Stack rỗng sau khi xoá 2 màn trên. |
| `app/DetailToDoScreen.tsx` | REMOVE | Todo list demo, không liên quan. |
| `app/(tabs)/_layout.tsx` | EXTEND | Khai báo 5 tab thay vì 2. |
| `app/(tabs)/HomeScreen.tsx` | REMOVE | Thay bằng `SwipeScreen`. |
| `app/(tabs)/ExploreScreen.tsx` | REMOVE | Thay bằng `DiscoverScreen`. |

### 4.2 Components (`src/components/`)

| Path | Quyết định | Lý do |
|---|---|---|
| `text/AppText.tsx` | GIỮ | Wrapper Text chuẩn (disable font scaling). |
| `button/AppButton.tsx` | GIỮ | Dùng xuyên suốt. |
| `input/TextInput.tsx` | GIỮ | Dùng cho NameScreen, ChatBox, search... |
| `image/RenderImage.tsx` | GIỮ | Dùng cho photo carousel + swipe card. |
| `modal/AppBottomSheet.tsx` | GIỮ | Filter, profile detail, photo viewer. |
| `modal/AppPopup.tsx` | GIỮ | Confirm/alert chung. |
| `modal/ExampleBottomSheet.tsx` | REMOVE | File ví dụ. |
| `navigation/BackButton.tsx` | GIỮ | Onboarding back, chat detail back. |
| `navigation/CustomHeader.tsx` | GIỮ | Header chuẩn cho stack screens. |
| `navigation/CustomTabBar.tsx` | EXTEND | Mở rộng `tabs` array từ 2 → 5; thêm icon từ `@expo/vector-icons`. |
| `tooltip/*` | GIỮ (sau khi fix) | `TooltipModal.tsx:4` đang import sai `useTheme` → fix thành `useAppTheme` (lỗi TS có sẵn). |
| `FPSCounter.tsx` | GIỮ | Dev utility. |

### 4.3 State / API / Theme / Util (`src/`)

| Path | Quyết định | Lý do |
|---|---|---|
| `api/axios/{client,common,config,queryClient,interceptors}.ts` | GIỮ | Tầng axios + react-query mới, sạch. |
| `api/services/authService.ts` | EXTEND | Đổi sang `onboardingService` + thêm `matchService`, `chatService`. Hoặc giữ tên file, đổi nội dung sang `submitOnboarding`, `getMe`. |
| `api/hooks/{useAuth,useUser}.ts` | EXTEND | Tái dùng pattern, đổi thành `useSubmitOnboarding`, `useMe`. |
| `api/index.ts` | GIỮ | Re-export. |
| `data/` (toàn bộ) | REMOVE | Tầng API legacy với bug `Token` field không tồn tại trên `PersistState` (lỗi TS). Tầng `src/api/` đã thay thế. |
| `zustand/persist.ts` | EXTEND | Thêm `userProfile`, `matchPreferences`, `onboardingStep`; cập nhật `partialize`. |
| `zustand/session.ts` | GIỮ | Ephemeral state, không liên quan domain. |
| `zustand/index.ts` | GIỮ | Re-export. |
| `theme/*` | GIỮ | Dark/Light + dimensions/fonts đầy đủ. |
| `localization/index.ts`, `i18next.d.ts`, `iLocalization.ts` | GIỮ | i18n EN/VI sẵn sàng. |
| `localization/resources/{en,vi}.ts` | EXTEND (sau khi fix) | Hiện có key `ja` thừa → bỏ (lỗi TS có sẵn). Sau đó thêm string mới cho onboarding/tabs/chat. |
| `constants/enum.ts` | EXTEND | Thêm `Gender`, `GenderInterest`, `RelationshipType`, `Zodiac`. |
| `utils/{Closure,anchor-point,functions/isObject}.ts` | GIỮ | Util chung. |
| `assets/*` | GIỮ | Có thể đổi icon brand sau, nhưng pipeline asset không đổi. |
| `scripts/` | GIỮ | Trống, không động. |

### 4.4 Lỗi TypeScript có sẵn cần dọn (đã phát hiện qua `gates/run-gates.sh`)

5 lỗi từ codebase hiện tại — sẽ được giải quyết trong **CLEANUP-001**:

1. `src/components/tooltip/TooltipModal.tsx:4` — import `useTheme` (không tồn tại) → đổi thành `useAppTheme`.
2. `src/data/api/index.ts:76` — dùng `PersistState.Token` không tồn tại → biến mất khi xoá thư mục `src/data/`.
3. `src/data/api/interceptor/AuthenticationInterceptor.ts:20` — same.
4. `src/localization/resources/en.ts:6` — key `ja` không có trong `iLocalization` → xoá.
5. `src/localization/resources/vi.ts:6` — same.

### 4.5 File config / hạ tầng

| File | Quyết định |
|---|---|
| `package.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, `metro.config.js`, `expo-env.d.ts`, `bun.lock` | GIỮ |
| `.husky/`, `.vscode/`, `.github/prompts.md` | GIỮ |
| `CLAUDE.md`, `.harness/`, `.claude/settings.json` | GIỮ (tooling Outer Harness đã wire ở turn trước) |

---

## 5. Domain types (chốt sớm để mọi task sau dùng chung)

Đặt ở `src/types/user.ts` (file mới):

```ts
export interface UserProfile {
  id: string;
  displayName: string;
  birthDate: string;          // ISO date
  zodiac: Zodiac;             // derived
  gender: Gender;
  photos: Photo[];            // 1..6
  interests: InterestAnswer[];
  bio?: string;
  completed: boolean;
}

export interface MatchPreferences {
  lookingFor: GenderInterest;
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipType: RelationshipType;
}

export interface Photo { id: string; uri: string; order: number; }
export interface InterestAnswer { questionId: string; selectedOptions: string[]; }
```

Enum mới ở `src/constants/enum.ts`: `Gender`, `GenderInterest`, `RelationshipType`, `Zodiac`.

---

## 6. Task split (tuần tự, mỗi task = 1 lệnh `init.sh`)

Đề xuất `<task-id>` tuân quy ước `<DOMAIN>-<seq>`. Sau khi spec/plan/approval xong, agent code, chạy `gates/run-gates.sh`, fill `progress.md#handoff`, đánh dấu `INDEX.md` = `completed`.

| # | Task ID | Tóm tắt | Acceptance |
|---|---|---|---|
| 1 | `CLEANUP-001` | Xoá `app/DetailToDoScreen.tsx`, `app/SigninStack/`, `src/components/modal/ExampleBottomSheet.tsx`, `src/data/`. Fix 5 lỗi TS có sẵn. Cập nhật `app/_layout.tsx` để bỏ route đã xoá. | `bash .harness/gates/run-gates.sh` PASS toàn bộ (lint + typecheck + test). |
| 2 | `DOMAIN-001` | Thêm enum (Gender, GenderInterest, RelationshipType, Zodiac), `src/types/user.ts`, `src/utils/zodiac.ts`, `src/constants/interestQuestions.ts`. Extend `zustand/persist.ts` với `userProfile`, `matchPreferences`, `onboardingStep`. | Typecheck PASS. `getZodiacFromBirthDate(new Date('1995-04-15'))` trả `Aries` (kiểm bằng REPL hoặc 1 file test nhỏ). |
| 3 | `ONBOARD-SHELL-001` | Tạo `app/OnboardingStack/_layout.tsx` + 9 màn placeholder. Component dùng chung `OnboardingProgressBar`, `OnboardingFooter`, hook `useOnboardingStep`. Cập nhật `app/_layout.tsx` + splash. | Cold-start app khi không có profile → vào màn 1; ấn Next/Back qua đủ 9 placeholder. |
| 4 | `ONBOARD-INPUTS-001` | Code 5 màn đầu: Name, Birthday (kèm hiển thị zodiac), Gender, LookingFor, AgeRange. Validate + persist. | Đi qua 5 màn, kill app, mở lại → đứng đúng bước đang dở; data đã nhập còn nguyên. |
| 5 | `ONBOARD-CHIPS-PHOTOS-001` | Code 4 màn còn lại: Interests (chip multi-section), Photos (1..6 dùng `expo-image-picker` — cần thêm dep), Distance, RelationshipType. Submit cuối → `completed = true` → vào `(tabs)`. | Chạy full flow lần đầu → land vào tab home. |
| 6 | `TABS-SHELL-001` | Mở rộng `(tabs)/_layout.tsx` + `CustomTabBar` thành 5 tab + icon. Tạo placeholder cho cả 5 tab, xoá `HomeScreen` + `ExploreScreen` cũ. | App boot vào tab Swipe (placeholder), bấm sang 4 tab khác đều render. |
| 7 | `SWIPE-001` | Card stack với gesture (react-native-gesture-handler + worklets đã có). Mock 20 candidates, lọc theo `matchPreferences`. Persist `iLiked` / `iPassed` vào zustand. | Vuốt 5 thẻ phải/trái → state cập nhật đúng; hết stack hiện empty state. |
| 8 | `DISCOVER-001` | Section grouping theo `RelationshipType` + 2 nhóm sở thích nổi bật. Horizontal scroll mini-card. Tap → BottomSheet profile detail. | ≥ 3 section render với mock; tap mở detail. |
| 9 | `LIKES-001` | Nested AppTab "I Liked" / "Liked Me". Grid thumbnail. Tab 2 có overlay paywall (visual). | Switch 2 sub-tab mượt, mock data render. |
| 10 | `CHAT-001` | List conversation + ChatBox. Status bubble: sending/sent/delivered/read + typing indicator. Mock messages trong zustand session. | Mở conv → gửi msg → thấy state chuyển; quay lại list thấy preview cập nhật. |
| 11 | `PROFILE-001` | Profile view + edit theo từng section (mở lại từng màn onboarding). Settings: theme toggle, language toggle, logout. | Toggle theme đổi UI; logout → clear `userProfile` → quay về onboarding màn 1. |
| 12 | `API-WIRE-001` | Service layer thật cho `onboardingService`, `matchService`, `chatService` (signature + mock). Dùng `@tanstack/react-query` (đã có) cho caching. Chuẩn bị slot để swap baseURL khi backend sẵn sàng. | Hooks gọi được, types đầy đủ, mock trả promise đúng shape. |

Optional (làm sau, không khoá luồng chính): animations refinement, theme polish, full localization VI, push notifications, deep linking, analytics SDK.

---

## 7. Cách chạy chuỗi task qua Outer Harness

```bash
# Bước 1: tạo task
bash .harness/init.sh CLEANUP-001 "Remove dead files and fix pre-existing TS errors"

# Bước 2: mở .harness/tasks/CLEANUP-001/spec.md, điền What/Why/Success criteria từ bảng trên
# Bước 3: planning (có thể nhờ agent), điền plan.md
# Bước 4: ghi approval vào approvals.md
# Bước 5: agent code
# Bước 6: gate
bash .harness/gates/run-gates.sh
# Bước 7: fill ## Handoff ở cuối progress.md, set status = completed trong tasks/INDEX.md
```

Lặp lại cho 11 task còn lại theo đúng thứ tự.

---

## 8. Rủi ro & quyết định để ngỏ

- **Backend**: chưa định API thật. Kế hoạch là build full UI với mock + types, rồi swap implementation ở `API-WIRE-001`. Nếu user đã có spec backend, đưa vào spec.md của `API-WIRE-001`.
- **`expo-image-picker`**: chưa có trong deps. Sẽ thêm ở `ONBOARD-CHIPS-PHOTOS-001` qua `bunx expo install expo-image-picker`.
- **Geolocation cho distance filter**: cần `expo-location`. Có thể delay tới `SWIPE-001`; hiện tại distance là input do user nhập, không yêu cầu GPS để hoàn tất onboarding.
- **Premium / Paywall ở tab Likes (sub-tab 2)**: v1 chỉ là visual; logic thanh toán không thuộc 12 task này.
- **Realtime chat**: v1 mock local. Khi wire backend, cân nhắc WebSocket / Pusher / Firebase — quyết định ở task riêng sau `API-WIRE-001`.
- **Image hosting**: ảnh profile cần CDN. v1 lưu `uri` local; cần thay khi có backend.
