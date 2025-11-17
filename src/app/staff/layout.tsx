import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 쿠키에서 accessToken 확인
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  // 현재 경로 확인
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";

  // /staff/signup이 아닌 경우에만 인증 체크
  if (!pathname.includes("/staff/signup") && !accessToken) {
    redirect("/staff/signup");
  }

  return <section>{children}</section>;
}
