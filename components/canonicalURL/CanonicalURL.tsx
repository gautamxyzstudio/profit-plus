"use client";
import { usePathname } from "next/navigation";

export const CanonicalURL = () => {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL;
  const pathName = usePathname();
console.log(baseURL + pathName);
  return <link rel="canonical" href={baseURL + pathName} />;
};
