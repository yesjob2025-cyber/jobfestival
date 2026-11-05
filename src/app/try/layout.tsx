import { FunFonts } from "@/components/fun/fun-fonts";

export default function TryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <FunFonts />
      {children}
    </>
  );
}
