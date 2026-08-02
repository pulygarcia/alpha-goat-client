'use client';

import Image from 'next/image';
import { Fragment, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useGlobalStats } from '@/features/stats/hooks/useGlobalStats';
import type { GlobalStats } from '@/features/stats/types/stats.types';

interface WelcomeScreenProps {
  onStart: () => void;
}

interface Counter {
  value: string;
  label: string;
}

interface Step {
  headline: string;
  paragraph: string;
  hasCounters?: boolean;
}

function formatCount(value: number) {
  return new Intl.NumberFormat('es-AR').format(value);
}

function getCounters(stats: GlobalStats | undefined): Counter[] {
  return [
    {
      value: stats ? formatCount(stats.alfajoresTotal) : '—',
      label: 'Alfajores',
    },
    { value: stats ? formatCount(stats.reviewsTotal) : '—', label: 'Reseñas' },
    { value: stats ? formatCount(stats.usersTotal) : '—', label: 'Usuarios' },
  ];
}

const STEPS: Step[] = [
  {
    headline: 'Todos los alfajores, un solo puntaje',
    paragraph:
      'Probá, puntuá y descubrí cuáles valen la pena según miles de argentinos que ya los comieron.',
    hasCounters: true,
  },
  {
    headline: 'Mirá lo que puntuó la gente',
    paragraph:
      'Seguí a tus amigos y enterate qué alfajores probaron, cuáles se salvan y cuáles no vale la pena ni abrir.',
  },
  {
    headline: 'Armá tu propio álbum',
    paragraph:
      'Agrupá tus alfajores favoritos en álbumes públicos y compartilos con quien quieras.',
  },
];

const SWIPE_THRESHOLD = 60;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const { data: globalStats } = useGlobalStats();
  const counters = getCounters(globalStats);

  function goToStep(index: number) {
    setStepIndex(Math.min(Math.max(index, 0), STEPS.length - 1));
  }

  function handlePrimaryClick() {
    if (isLastStep) {
      onStart();
    } else {
      goToStep(stepIndex + 1);
    }
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goToStep(stepIndex + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goToStep(stepIndex - 1);
    }
  }

  return (
    <div className="bg-blanco-tibio relative flex min-h-[100dvh] flex-col overflow-hidden lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-20">
      <div
        aria-hidden="true"
        className="bg-crema absolute top-[-56px] right-[-96px] h-[470px] w-[470px] rounded-full lg:top-[-160px] lg:right-[-200px] lg:h-[720px] lg:w-[720px]"
      />

      <motion.div
        aria-hidden="true"
        className="absolute top-[56px] right-[-104px] w-[430px] lg:top-1/2 lg:right-[2%] lg:w-[46%] lg:max-w-[560px] lg:-translate-y-1/2"
        initial={reducedMotion ? undefined : { opacity: 0, scale: 0.92, y: 12 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Image
          src="/alfajor-hero.png"
          alt=""
          width={1024}
          height={1024}
          priority
          className="h-auto w-full"
          style={{ filter: 'drop-shadow(0 46px 60px rgba(74,30,8,.42))' }}
        />
      </motion.div>

      <motion.div
        initial={reducedMotion ? undefined : 'hidden'}
        animate={reducedMotion ? undefined : 'visible'}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.15 },
          },
        }}
        className="relative mt-auto flex flex-col gap-5 px-[30px] pb-[34px] lg:mt-0 lg:w-full lg:max-w-[540px] lg:gap-7 lg:px-0 lg:py-0"
      >
        <motion.div
          variants={reducedMotion ? undefined : fadeUp}
          role="tablist"
          aria-label="Pasos de bienvenida"
          className="flex items-center gap-1.5"
        >
          {STEPS.map((stepItem, index) => (
            <button
              key={stepItem.headline}
              type="button"
              role="tab"
              aria-selected={index === stepIndex}
              aria-label={`Paso ${index + 1} de ${STEPS.length}`}
              onClick={() => goToStep(index)}
              className={cn(
                'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                index === stepIndex ? 'bg-ink w-6' : 'bg-border w-1.5',
              )}
            />
          ))}
        </motion.div>

        <motion.div
          variants={reducedMotion ? undefined : fadeUp}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stepIndex}
              initial={reducedMotion ? undefined : { opacity: 0, x: 24 }}
              animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col gap-5"
            >
              <h1
                className="text-ink font-archivo text-[46px] lg:text-[64px]"
                style={{
                  lineHeight: 0.98,
                  letterSpacing: '-0.05em',
                  textWrap: 'pretty',
                }}
              >
                {step.headline}
              </h1>

              <p
                className="text-gris-400 font-inter text-[15px] lg:max-w-[440px] lg:text-[17px]"
                style={{ lineHeight: 1.55 }}
              >
                {step.paragraph}
              </p>

              {step.hasCounters && (
                <div className="border-border flex items-center gap-[18px] border-t pt-[14px] pb-0.5">
                  {counters.map((counter, index) => (
                    <Fragment key={counter.label}>
                      {index > 0 && (
                        <span
                          aria-hidden="true"
                          className="bg-border h-[30px] w-px shrink-0"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-ink font-archivo text-[22px] lg:text-[28px]"
                          style={{ letterSpacing: '-0.04em' }}
                        >
                          {counter.value}
                        </span>
                        <span
                          className="text-gris-300 font-mono text-[9.5px] uppercase lg:text-[11px]"
                          style={{ letterSpacing: '0.18em' }}
                        >
                          {counter.label}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.button
          variants={reducedMotion ? undefined : fadeUp}
          type="button"
          onClick={handlePrimaryClick}
          className="bg-ink text-blanco-tibio font-inter flex h-[58px] w-full cursor-pointer items-center justify-center rounded-full text-base font-semibold transition-transform hover:-translate-y-px lg:w-auto lg:px-12"
        >
          {isLastStep ? 'Empezar' : 'Siguiente'}
        </motion.button>
      </motion.div>
    </div>
  );
}
