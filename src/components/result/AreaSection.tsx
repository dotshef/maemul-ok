"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { AreaResult } from "@/types/building";

export function AreaSection({ data }: { data: AreaResult }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: number, field: string) => {
    await navigator.clipboard.writeText(String(value));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">면적</h2>
      {data.typeMismatch && (
        <p className="text-base text-destructive mb-4">
          일치하지 않는 정보가 있습니다. 서비스 관리자에게 문의하세요.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        {/* 타입 */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-base text-muted-foreground">타입</p>
            {data.typeName ? (
              <p className="text-2xl font-bold mt-1">{data.typeName}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                타입 정보가 지원되지 않습니다. 관리자에 문의하세요
              </p>
            )}
          </CardContent>
        </Card>

        {/* 전용면적 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-base text-muted-foreground">전용면적</p>
              <button
                onClick={() => handleCopy(data.exclusiveArea, "exclusive")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {copiedField === "exclusive" ? "복사됨" : "복사"}
              </button>
            </div>
            <p className="text-2xl font-bold mt-1">
              {data.exclusiveArea}㎡
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({data.exclusiveAreaPy}평)
              </span>
            </p>
          </CardContent>
        </Card>

        {/* 공용면적 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-base text-muted-foreground">공용면적</p>
              <button
                onClick={() => handleCopy(data.commonArea, "common")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {copiedField === "common" ? "복사됨" : "복사"}
              </button>
            </div>
            <p className="text-2xl font-bold mt-1">
              {data.commonArea}㎡
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({data.commonAreaPy}평)
              </span>
            </p>
          </CardContent>
        </Card>

        {/* 계약면적 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-base text-muted-foreground">계약면적</p>
              <button
                onClick={() => handleCopy(data.supplyArea, "supply")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {copiedField === "supply" ? "복사됨" : "복사"}
              </button>
            </div>
            <p className="text-2xl font-bold mt-1">
              {data.supplyArea}㎡
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({data.supplyAreaPy}평)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
