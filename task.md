# 건축물대장 면적 조회 서비스 — 구현 태스크

## 현재 상태
- Next.js 16.2.1 + React 19 + Tailwind v4 설치됨
- shadcn 미설치
- 페이지/API Route 없음 (보일러플레이트만 존재)

---

## 구현 순서

### STEP 0. 환경 세팅
- [ ] shadcn/ui 초기화 (`npx shadcn@latest init`)
- [ ] 필요한 shadcn 컴포넌트 설치 (Button, Input, Card, Label)
- [ ] Pretendard 폰트 적용 (CDN 또는 next/font)
- [ ] globals.css에 네이비 계열 테마 색상 정의
- [ ] shadow 제거, font-sm 이하 미사용 규칙 적용

### STEP 1. API Route 구현 — `/api/area`
- [ ] `src/app/api/area/route.ts` 생성
- [ ] 요청 파라미터 수신: sigunguCd, bjdongCd, bun, ji, dong, ho
- [ ] 건축물대장 전유공용면적 API 호출 (공공데이터포털)
- [ ] 응답에서 dong/ho 매칭하여 전용·공용면적 추출
- [ ] 공급면적 계산 (전용 + 공용)
- [ ] 평수 환산 (÷ 3.306)
- [ ] 에러 처리 (건물 없음, 동/호 불일치, API 오류 등)
- [ ] `.env.local`에 `BUILDING_API_KEY` 환경변수 설정

### STEP 2. 프론트엔드 — 주소 검색 + 입력 폼
- [ ] 카카오 우편번호 SDK 스크립트 로드 (`layout.tsx` 또는 동적 로드)
- [ ] 주소 검색 버튼 클릭 → 카카오 팝업 → bcode, jibunAddress 추출
- [ ] bcode 파싱: sigunguCd (앞5자리), bjdongCd (뒤5자리)
- [ ] jibunAddress 파싱: bun, ji (4자리 zero-padding)
- [ ] 동/호 텍스트 입력 필드 (동은 선택, 호는 필수)

### STEP 3. 프론트엔드 — 결과 조회 + 표시
- [ ] "면적 조회" 버튼 → `/api/area` 호출
- [ ] 로딩 상태 표시
- [ ] 결과 카드: 전용면적, 공용면적, 공급면적 (㎡ + 평)
- [ ] 에러 메시지 표시 (PRD 섹션5 기준)
- [ ] "결과 복사" 버튼 (클립보드 복사)

### STEP 4. 페이지 조립 + 마무리
- [ ] `src/app/page.tsx`에 전체 UI 조립
- [ ] 반응형 레이아웃 확인
- [ ] 큰 글씨 (50~60대 사용자 대상) 최종 확인
- [ ] 보일러플레이트 정리 (기본 Next.js 코드 제거)
