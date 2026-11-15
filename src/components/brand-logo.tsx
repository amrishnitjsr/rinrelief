import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "dark" | "light";
};

export function BrandLogo({ className = "h-10 w-auto", priority = false, variant = "dark" }: BrandLogoProps) {
  return (
    <Image
      src={`/logos/rinrelife ${variant}.svg`}
      alt="Rinrelife"
      width={420}
      height={260}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
