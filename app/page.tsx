import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image
        src="/Logo.png"   // ✅ exact filename with capital "L"
        alt="EnatBet Logo"
        width={200}
        height={200}
        className="mb-6"
      />
      <h1 className="text-5xl font-bold">EnatBet</h1>
      <p className="mt-4 text-lg opacity-80">
        Book a home, not just a room!
      </p>
    </main>
  );
}
