# 인증 및 사용량 추적 설계

## 1. 데이터 스키마 (Supabase)

### 1-1. Auth (Supabase Auth 기본 제공)

Supabase Auth가 `auth.users` 테이블을 자동 관리한다.
별도 users 테이블은 만들지 않고, 필요 시 `profiles` 테이블로 확장한다.

### 1-2. profiles 테이블

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz default now()
);

-- 새 유저 가입 시 자동 생성 (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 1-3. query_logs 테이블

```sql
create table public.query_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,           -- 조회한 지번주소
  dong text,                       -- 동
  ho text not null,                -- 호
  created_at timestamptz default now()
);

create index idx_query_logs_user_id on public.query_logs(user_id);
create index idx_query_logs_created_at on public.query_logs(created_at);
```

### 1-4. RLS (Row Level Security)

```sql
alter table public.profiles enable row level security;
alter table public.query_logs enable row level security;

-- profiles: 본인만 조회/수정
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- query_logs: 본인만 조회, 인증된 사용자만 삽입
create policy "query_logs_select_own" on public.query_logs
  for select using (auth.uid() = user_id);
create policy "query_logs_insert_auth" on public.query_logs
  for insert with check (auth.uid() = user_id);
```

---

## 2. API 설계

### 2-1. 인증 (Supabase Client SDK 직접 호출)

클라이언트에서 `@supabase/supabase-js`로 직접 처리. 별도 API route 불필요.

| 동작 | 메서드 |
|------|--------|
| 회원가입 | `supabase.auth.signUp({ email, password })` |
| 로그인 | `supabase.auth.signInWithPassword({ email, password })` |
| 로그아웃 | `supabase.auth.signOut()` |
| 세션 확인 | `supabase.auth.getSession()` |

### 2-2. 조회 기록 저장

기존 `/api/area` 응답 성공 시, 클라이언트에서 Supabase에 직접 insert.

```ts
// 조회 성공 후
await supabase.from("query_logs").insert({
  user_id: session.user.id,
  address: address.jibunAddress,
  dong: parsed.dong || null,
  ho: parsed.ho,
});
```

### 2-3. 사용량 조회

```ts
// 이번 달 조회 횟수
const { count } = await supabase
  .from("query_logs")
  .select("*", { count: "exact", head: true })
  .eq("user_id", session.user.id)
  .gte("created_at", startOfMonth);
```

---

## 3. 화면 설계

### 3-1. 페이지 구성

| 경로 | 설명 | 인증 필요 |
|------|------|-----------|
| `/login` | 로그인 페이지 | X |
| `/signup` | 회원가입 페이지 | X |
| `/` | 매물 면적 조회 (기존) | O (미인증 시 `/login`으로 리다이렉트) |

### 3-2. 로그인 페이지 (`/login`)

```
┌──────────────────────────────┐
│         매물빨리 로고          │
│                              │
│  이메일    [________________] │
│  비밀번호  [________________] │
│                              │
│        [ 로그인 ]             │
│                              │
│  계정이 없으신가요? 회원가입    │
└──────────────────────────────┘
```

- 중앙 정렬, `max-w-sm`
- 기존 디자인 톤 유지 (bg-card, border, rounded-lg)
- 에러 메시지는 폼 하단에 빨간 텍스트

### 3-3. 회원가입 페이지 (`/signup`)

```
┌──────────────────────────────┐
│         매물빨리 로고          │
│                              │
│  이메일    [________________] │
│  비밀번호  [________________] │
│  비밀번호  [________________] │
│  확인                        │
│                              │
│        [ 회원가입 ]           │
│                              │
│  이미 계정이 있으신가요? 로그인 │
└──────────────────────────────┘
```

- 비밀번호 확인 필드 추가
- 가입 성공 시 이메일 인증 안내 또는 자동 로그인 후 `/`로 이동

### 3-4. 헤더 변경

```
┌─────────────────────────────────────────┐
│  매물 면적 정보 조회    [문의하기] [로그아웃] │
└─────────────────────────────────────────┘
```

- 로그인 상태: 문의하기 + 로그아웃 버튼
- 비로그인 상태: 헤더 숨김 (로그인/회원가입 페이지에서는 자체 레이아웃)

---

## 4. 구현 순서

- [ ] Supabase 프로젝트 설정 및 환경변수 추가 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] `@supabase/supabase-js` 설치 및 클라이언트 유틸 생성 (`src/lib/supabase.ts`)
- [ ] Supabase에 profiles, query_logs 테이블 + RLS 생성
- [ ] `/login` 페이지 구현
- [ ] `/signup` 페이지 구현
- [ ] 인증 상태 관리 (Context 또는 미들웨어)
- [ ] 미인증 시 `/login` 리다이렉트 (middleware.ts)
- [ ] 헤더에 로그아웃 버튼 추가
- [ ] 조회 성공 시 query_logs insert
- [ ] 사용량 표시 (선택)
