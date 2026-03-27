# page-refactor.md 기반 페이지 리팩토링 계획

## 배경

`reference/page-refactor.md` 기준으로 조회 결과를 4개 섹션으로 구성한다.
현재는 면적 정보만 표시 중이며, 기본 정보·층수를 추가하고 소유자는 보류한다.

---

## 1단계: API 확장

### 1-1. 새 API 엔드포인트 생성: `/api/building`

getBrTitleInfo (표제부) 호출용 라우트를 신규 생성한다.

- **엔드포인트**: `GET /api/building?sigunguCd=...&bjdongCd=...&bun=...&ji=...`
- **호출 API**: `http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo`
- **응답 필드**:
  | 필드 | 원본 키 | 설명 |
  |------|---------|------|
  | mainPurpose | mainPurpsCdNm | 용도 (예: 업무시설(오피스텔)) |
  | useAprDay | useAprDay | 사용승인일 (예: "20130226") |
  | groundFloors | grndFlrCnt | 지상 층수 |
  | undergroundFloors | ugrndFlrCnt | 지하 층수 |

### 1-2. 기존 `/api/area` 수정

- 응답에 `flrNo` (해당 층) 필드 추가 — 이미 API 응답에 포함되어 있으나 현재 무시 중

### 1-3. 소유자 API — 보류

- 공공데이터포털 건축소유자정보 API(dataset 15021136)는 폐지됨 (개인정보 보호)
- 무료 공공 API로 소유자 정보 조회 불가
- 향후 유료 API(bigvalue 등) 검토 또는 기능 제외 결정 필요
- **page-refactor.md의 소유자 섹션은 이번 작업에서 제외**

---

## 2단계: 페이지 레이아웃

### 조회 폼 (기존 유지)
- 주소 검색 + 상세주소 입력 (가로 배치, 현행 유지)

### 조회 결과 — 4개 섹션 (소유자 제외 시 3개)

```
┌─────────────────────────────────────────────┐
│ 1. 기본 정보                                  │
│   용도: 업무시설(오피스텔)                       │
│   사용승인일: 2013.02.26                       │
├─────────────────────────────────────────────┤
│ 2. 면적                          (기존 2x2)   │
│   타입 | 전용면적 | 공용면적 | 계약면적           │
├─────────────────────────────────────────────┤
│ 3. 층수                                      │
│   해당 층: 4층 | 전체 층: 지상 20층 / 지하 4층   │
└─────────────────────────────────────────────┘
```

- 각 섹션은 Card 또는 시각적으로 구분된 블록
- 면적 섹션은 기존 2x2 그리드 유지
- 기본 정보·층수는 단순 key-value 표시

---

## 3단계: 코드 구조

### 3-1. 타입 정의 분리

`src/types/building.ts` 생성:
- `AddressInfo` — 주소 검색 결과 (기존)
- `AreaResult` — 면적 조회 결과 (기존 + flrNo 추가)
- `BuildingInfo` — 표제부 조회 결과 (신규)

### 3-2. API 호출 함수 분리

`src/lib/api.ts` 생성:
- `fetchArea(params)` — /api/area 호출
- `fetchBuilding(params)` — /api/building 호출
- 두 API는 클라이언트에서 **병렬 호출** (Promise.all)

### 3-3. 섹션 컴포넌트 분리

`src/components/result/` 디렉토리:
- `BasicInfoSection.tsx` — 용도, 사용승인일
- `AreaSection.tsx` — 타입, 전용/공용/계약면적 (기존 2x2 그리드 이동)
- `FloorSection.tsx` — 해당 층, 전체 층

### 3-4. page.tsx 간소화

- 상태 관리 + 폼 + 결과 섹션 조합만 담당
- 각 섹션 컴포넌트에 props 전달

---

## 작업 순서 (체크리스트)

- [ ] `src/types/building.ts` 생성 (타입 정의)
- [ ] `src/app/api/building/route.ts` 생성 (getBrTitleInfo 호출)
- [ ] `src/app/api/area/route.ts` 수정 (flrNo 응답 추가)
- [ ] `src/lib/api.ts` 생성 (클라이언트 API 호출 함수)
- [ ] `src/components/result/BasicInfoSection.tsx` 생성
- [ ] `src/components/result/AreaSection.tsx` 생성
- [ ] `src/components/result/FloorSection.tsx` 생성
- [ ] `src/app/page.tsx` 리팩토링 (섹션 조합 구조)
- [ ] 동작 확인 및 디버깅
