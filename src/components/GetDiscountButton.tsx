"use client";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export default function GetDiscountButton({ className, children }: Props) {
  return (
    <button
      className={className}
      onClick={() => window.dispatchEvent(new Event("open-discount-popup"))}
    >
      {children ?? "Get 20% Off Your First Order"}
    </button>
  );
}
