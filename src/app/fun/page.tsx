import { Confetti } from "@/components/kdu/confetti";
import { EventTile } from "@/components/fun/ui";
import { FUN, FUN_EVENTS } from "@/lib/fun/config";

/** 부대행사 메인 — 이벤트 고르기 (각 이벤트는 독립된 주소로, 태블릿마다 하나씩 띄워 운영) */
export default function FunHomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-kdu-sky via-[#3EC3FE] to-kdu-sky-light">
        <Confetti />
        <div className="wrap relative flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="inline-block -rotate-2 rounded-xl bg-kdu-navy px-5 py-2 font-jua text-xl text-white shadow-[0_5px_0_#0B2A78]">
              즐길 거리 <span className="text-kdu-yellow">가득!</span>
            </p>
            <h1 className="kdu-3d mt-5 font-fun text-[clamp(2.8rem,8vw,5rem)] font-bold leading-none text-white">
              <span className="text-kdu-yellow">Fun</span> Fun 부대행사
            </h1>
            <p className="mt-4 font-jua text-xl text-kdu-navy-deep">
              {FUN.school} {FUN.festival} · 결과는 모두 📱 QR로 내 폰에!
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FUN.mascot} alt="" className="kdu-float w-40 drop-shadow-xl sm:w-52" />
        </div>
      </section>
      <section className="wrap py-10">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FUN_EVENTS.map((e) => (
            <li key={e.slug}>
              <EventTile event={e} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
