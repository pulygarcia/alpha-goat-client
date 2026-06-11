interface Props {
  activeStep: 1 | 2 | 3;
}

const words = ['Probá.', 'Opiná.', 'Puntuá.'] as const;
const baseOpacity = [0.12, 0.09, 0.14];

export default function HeroWords({ activeStep }: Props) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden px-10 py-12"
      style={{ zIndex: 2 }}
    >
      {words.map((word, i) => (
        <span
          key={word}
          className="font-archivo block leading-[0.92] tracking-[-0.045em] uppercase transition-all duration-[600ms]"
          style={{
            fontSize: '30vh',
            opacity: activeStep === i + 1 ? 0.35 : baseOpacity[i],
            color: activeStep === i + 1 ? '#ffb53d' : '#f4a02b',
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
