import type { AreaResult, BuildingInfo } from "@/types/building";

interface FetchParams {
  sigunguCd: string;
  bjdongCd: string;
  bun: string;
  ji: string;
  ho: string;
  dong?: string;
}

export async function fetchArea(params: FetchParams): Promise<AreaResult> {
  const qs = new URLSearchParams({
    sigunguCd: params.sigunguCd,
    bjdongCd: params.bjdongCd,
    bun: params.bun,
    ji: params.ji,
    ho: params.ho,
  });
  if (params.dong) qs.set("dong", params.dong);

  const res = await fetch(`/api/area?${qs.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "면적 조회 중 오류가 발생했습니다.");
  return data;
}

export async function fetchBuilding(params: Omit<FetchParams, "ho" | "dong">): Promise<BuildingInfo> {
  const qs = new URLSearchParams({
    sigunguCd: params.sigunguCd,
    bjdongCd: params.bjdongCd,
    bun: params.bun,
    ji: params.ji,
  });

  const res = await fetch(`/api/building?${qs.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "건물 정보 조회 중 오류가 발생했습니다.");
  return data;
}
