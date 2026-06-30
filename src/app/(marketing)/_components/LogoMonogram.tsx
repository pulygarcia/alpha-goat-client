import Image from 'next/image';

export function LogoMonogram() {
  return (
    <Image
      src="/alphagoat-logo.png"
      alt="AlphaGoat"
      width={56}
      height={56}
      priority
      className="rounded-full object-cover"
    />
  );
}
