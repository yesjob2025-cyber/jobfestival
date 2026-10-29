import Link from "next/link";
import { FUN } from "@/lib/fun/config";

export function NotFound() {
  return (
    <div className="kdu-card p-8 text-center">
      <p className="font-jua text-2xl text-kdu-navy-deep">결과를 찾을 수 없어요 😢</p>
      <p className="mt-2 text-sm text-ink-muted">QR 코드를 다시 찍거나, {FUN.keepDays}일이 지나 지워졌는지 확인해 주세요.</p>
    </div>
  );
}

export function BackLink() {
  return (
    <div className="mt-8 text-center">
      <Link href="/fun" className="font-jua text-lg text-kdu-navy underline underline-offset-4">
        다른 부대행사도 구경하기 →
      </Link>
    </div>
  );
}
