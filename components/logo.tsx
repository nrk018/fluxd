import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const dimensions = {
    sm: { width: 100, height: 40 },
    md: { width: 140, height: 56 },
    lg: { width: 180, height: 72 },
  }

  const dim = dimensions[size]

  return <Image src="/fluxd-logo.png" alt="Fluxd" width={dim.width} height={dim.height} className="h-auto" priority />
}
