"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-4  text-center min-h-screen bg-primary-100">
      <h4 className="title2 my-15">
        스마트학생복 청주점 <br />
        교복 측정 대기 등록
      </h4>
      <button
        type="button"
        onClick={() => router.push("/add")}
        className="headline cursor-pointer"
      >
        <Image
          src="/student/onboarding.svg"
          alt="logo"
          width={200}
          height={100}
        />
        Self Check In
      </button>
    </main>
  );
}
