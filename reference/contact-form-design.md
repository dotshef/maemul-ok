# 문의하기 폼 설계

## 개요

헤더의 "문의하기" 버튼 클릭 시 모달 폼을 표시하고, Resend API를 통해 이메일로 문의 내용을 전달하는 기능.

## 현재 상태

- `src/app/layout.tsx` 헤더에 `<a href="mailto:support@maemul.ok">문의하기</a>` 링크 존재
- 클릭 시 기본 메일 클라이언트가 열림 (UX 불편)

## 변경 목표

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 문의하기 버튼 | mailto 링크 | 모달 폼 트리거 버튼 |
| 폼 UI | 없음 | 모달 내 textarea + 제출 버튼 |
| 이메일 전송 | 사용자 메일 클라이언트 | Resend API (서버사이드) |

## 폼 구성

### 필드

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 내용 | textarea | O | 문의 내용 (최소 10자) |

### 버튼

- **제출하기** — 폼 전송 및 Resend API 호출

## 아키텍처

```
[문의하기 버튼 클릭]
    ↓
[모달 폼 열림] (클라이언트 컴포넌트)
    ↓
[내용 입력 → 제출하기 클릭]
    ↓
[POST /api/contact] (Next.js Route Handler)
    ↓
[Resend SDK → 이메일 전송]
    ↓
[성공/실패 응답 → 모달 내 피드백]
```

## 파일 변경 목록

### 1. 패키지 설치

```bash
npm install resend
```

### 2. 환경변수 추가 (`.env.local`)

```
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=contact@dotshef.com
```

- `RESEND_API_KEY`: Resend 대시보드에서 발급받은 API 키
- `CONTACT_EMAIL`: 문의 이메일을 수신할 주소

### 3. 신규 파일

#### `src/app/api/contact/route.ts` — API Route Handler

- POST 요청 수신
- Request body에서 `message` 추출
- 유효성 검증 (빈 값, 최소 길이)
- Resend SDK로 이메일 전송
- 응답 반환 (성공/실패)

```ts
// 핵심 로직
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { message } = await request.json();

  // 유효성 검증
  if (!message || message.trim().length < 10) {
    return Response.json(
      { error: "내용을 10자 이상 입력해주세요." },
      { status: 400 }
    );
  }

  const { error } = await resend.emails.send({
    from: "매물빨리 <onboarding@resend.dev>",  // Resend 기본 도메인 또는 커스텀 도메인
    to: [process.env.CONTACT_EMAIL!],
    subject: "[매물빨리] 새로운 문의가 접수되었습니다",
    text: message,
  });

  if (error) {
    return Response.json({ error: "전송에 실패했습니다." }, { status: 500 });
  }

  return Response.json({ success: true });
}
```

#### `src/components/ContactModal.tsx` — 문의 모달 컴포넌트

- 클라이언트 컴포넌트 (`"use client"`)
- 상태: `open` (모달 표시), `message` (입력값), `status` (idle/loading/success/error)
- 모달 오버레이 + 중앙 카드 레이아웃
- 기존 shadcn `Button`, `Card` 컴포넌트 활용

```
구조:
┌──────────────────────────┐
│  문의하기            [X]  │
├──────────────────────────┤
│                          │
│  ┌────────────────────┐  │
│  │  textarea           │  │
│  │  (내용을 입력하세요) │  │
│  │                     │  │
│  └────────────────────┘  │
│                          │
│         [제출하기]        │
│                          │
└──────────────────────────┘
```

- 제출 시 `/api/contact`로 POST 요청
- 로딩 중: 버튼 비활성화 + "전송 중..." 표시
- 성공: "문의가 접수되었습니다" 메시지 표시 후 모달 닫힘
- 실패: 에러 메시지 표시

### 4. 기존 파일 수정

#### `src/app/layout.tsx`

- `<a href="mailto:...">` → `<ContactModal />` 컴포넌트로 교체
- 헤더를 클라이언트 컴포넌트로 분리하거나, ContactModal을 독립적으로 import

변경 전:
```tsx
<a href="mailto:support@maemul.ok" className="...">문의하기</a>
```

변경 후:
```tsx
<ContactModal />
```

> layout.tsx는 서버 컴포넌트이므로, ContactModal은 `"use client"` 선언된 별도 컴포넌트 파일에서 import.

## Resend 설정 가이드

1. [resend.com](https://resend.com)에서 계정 생성
2. Dashboard → API Keys → API Key 생성
3. `.env.local`에 `RESEND_API_KEY` 추가
4. (선택) 커스텀 도메인 연결 시 `from` 주소를 커스텀 도메인으로 변경
   - 기본값: `onboarding@resend.dev` (테스트용, 본인 이메일로만 전송 가능)
   - 프로덕션: 도메인 인증 후 `noreply@maemulppalli.com` 등 사용

## 주의사항

- Resend 무료 플랜: 월 100건, 일 100건 제한
- `onboarding@resend.dev` 발신자는 Resend 계정 소유자 이메일로만 전송 가능 (테스트용)
- 프로덕션 배포 시 반드시 커스텀 도메인 인증 필요
- Rate limiting은 Resend 자체 제한에 의존 (추가 구현 불필요)
