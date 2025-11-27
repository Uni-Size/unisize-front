"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-4 text-center flex flex-col items-center justify-center min-h-screen bg-primary-100">
      <h4 className="title2 mb-36">
        스마트학생복 청주점 <br />
        교복 측정 대기 등록
      </h4>
      <Image
        src="/student/onboarding.svg"
        alt="logo"
        width={100}
        height={100}
      />

      <button
        type="button"
        onClick={() => router.push("/signup")}
        className="headline mt-12 cursor-pointer"
      >
        Self Check In
      </button>
    </main>
  );
}
