import Image from 'next/image';

export function LogoMonogram() {
  return (
    <Image
      src="/alphagoat-logo.svg"
      alt="AlphaGoat"
      width={56}
      height={56}
      priority
    />
  );
}
