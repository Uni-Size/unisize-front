"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className=" p-4 text-center flex flex-col items-center justify-center min-h-screen">
      <Image src="/logo.png" alt="logo" width={100} height={100} />
      <p className="text-center">스마트학생복에 방문해주셔서 감사합니다.</p>
      <h4>본 시스템은 스마트학생복 청주점만을 위해 개발된 시스템입니다.</h4>
      <p>사진, 캡쳐 등 유출하지 마세요</p>
      <button type="button" onClick={() => router.push("/signup")}>
        학생 등록하기
      </button>
    </main>
  );
}
