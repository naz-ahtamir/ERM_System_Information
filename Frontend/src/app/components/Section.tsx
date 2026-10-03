import { ReactNode } from "react";

export function MaxWidth({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-5 md:px-10">{children}</div>;
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-16 md:py-24 px-5 md:px-10 ${className}`}>
      <MaxWidth>{children}</MaxWidth>
    </section>
  );
}
