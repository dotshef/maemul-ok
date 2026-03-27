import { Card, CardContent } from "@/components/ui/card";
import type { BuildingInfo } from "@/types/building";

export function BasicInfoSection({ data }: { data: BuildingInfo }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">기본 정보</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-base text-muted-foreground">건축물용도</p>
            <p className="text-2xl font-bold mt-1">
              {data.mainPurpose ?? "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base text-muted-foreground">사용승인일</p>
            <p className="text-2xl font-bold mt-1">
              {data.useAprDay ?? "-"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
