import React from "react";
import PageWrapper from "@/components/layout/PageWrapper";

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper>{children}</PageWrapper>;
}
