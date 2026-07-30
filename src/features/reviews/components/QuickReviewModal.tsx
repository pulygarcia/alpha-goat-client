'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useAlfajores } from '@/features/alfajores/hooks/useAlfajores';
import { ProposeAlfajorModal } from '@/features/alfajores/components/ProposeAlfajorModal';
import { ReviewWizardForm, type WizardStep } from './ReviewWizardForm';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

/**
 * Modal de "reseña rápida": un wizard que elige un alfajor (buscador) y deja
 * reseñarlo ahí mismo (comentario → puntajes + foto). Si recibe `alfajor`
 * (desde el detalle), se saltea el paso de elegir. Controlado por `open`.
 */
export function QuickReviewModal({
  open,
  onOpenChange,
  alfajor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alfajor?: Alfajor;
}) {
  const [selected, setSelected] = useState<Alfajor | null>(alfajor ?? null);
  const [wizardStep, setWizardStep] = useState<WizardStep>('comentario');
  const [proposeOpen, setProposeOpen] = useState(false);
  const reduce = useReducedMotion();

  // Al cerrar, vuelve al estado inicial (preselección o picker) para que el
  // próximo open arranque limpio — sin un effect que sincronice `open`.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelected(alfajor ?? null);
      setWizardStep('comentario');
    }
    onOpenChange(next);
  }

  function backToPicker() {
    setSelected(null);
    setWizardStep('comentario');
  }

  // Pasos: si el alfajor viene preseleccionado (desde su ficha) se saltea el de
  // elegir → 2 pasos; si no, 3. La barra segmentada es solo indicador.
  const steps = alfajor
    ? [{ label: 'Reseña' }, { label: 'Puntajes' }]
    : [{ label: 'Alfajor' }, { label: 'Reseña' }, { label: 'Puntajes' }];
  const wizardIndex = wizardStep === 'comentario' ? 0 : 1;
  const current = selected ? wizardIndex + (alfajor ? 0 : 1) : 0;

  // Abrir "proponer" cierra el modal de reseña para no apilar Dialogs.
  function openPropose() {
    onOpenChange(false);
    setProposeOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* Hoja anclada abajo con alto fijo: los tres pasos miden lo mismo, así
            el diálogo no se sacude al avanzar. Sobreescribe el centrado del
            primitivo en vez de forkearlo (Radix conserva foco y escape). */}
        <DialogContent
          showClose={false}
          // Sin foco automático: en mobile enfocar el buscador al abrir levanta
          // el teclado y tapa la lista, cuando la mayoría entra a elegir de la
          // lista y no a escribir. El teclado aparece si tocan el input.
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="bg-blanco-tibio text-ink border-gris-50 top-auto bottom-0 left-1/2 flex h-[min(560px,92vh)] w-[min(520px,100vw)] max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[18px] rounded-b-none p-0 duration-[250ms] sm:rounded-b-none"
        >
          <DialogHeader className="flex-none space-y-0 px-[18px] pt-2.5">
            <DialogTitle className="sr-only">Reseñar un alfajor</DialogTitle>

            <div className="flex items-center gap-3">
              <span
                className="text-gris-300 flex-none text-[10px] tracking-[0.2em] uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Paso {current + 1} / {steps.length}
              </span>
              <div className="flex flex-1 gap-1" aria-hidden>
                {steps.map((s, i) => (
                  <span
                    key={s.label}
                    className={`h-[3px] flex-1 rounded-full transition-colors ${
                      i <= current ? 'bg-ink' : 'bg-gris-50'
                    }`}
                  />
                ))}
              </div>
              <DialogClose
                aria-label="Cerrar"
                className="text-gris-300 hover:text-ink flex h-7 w-7 flex-none items-center justify-center rounded-full transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </DialogClose>
            </div>

            {selected && (
              // Chip del alfajor elegido: el contexto viaja con el usuario a
              // través de los pasos, que es lo que el paso 1 dejó de mostrar.
              <div className="bg-gris-25 mt-3 flex items-center gap-2.5 rounded-[10px] p-2">
                <AlfajorThumb
                  nombre={selected.nombre}
                  imagenUrl={selected.imagenUrl}
                />
                <div className="min-w-0">
                  <p className="text-ink truncate text-[13px] font-semibold">
                    {selected.nombre}
                  </p>
                  {selected.marca && (
                    <p
                      className="text-cinnamon truncate text-[9.5px] tracking-[0.16em] uppercase"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {selected.marca.nombre}
                    </p>
                  )}
                </div>
                {!alfajor && (
                  <button
                    type="button"
                    onClick={backToPicker}
                    className="text-gris-400 hover:text-ink ml-auto flex-none text-[10px] tracking-[0.14em] uppercase underline decoration-[color:var(--color-gris-100)] underline-offset-4 transition-colors"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Cambiar
                  </button>
                )}
              </div>
            )}
          </DialogHeader>

          <motion.div
            className="flex min-h-0 flex-1 flex-col"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {selected ? (
              <ReviewWizardForm
                alfajor={selected}
                onBack={alfajor ? undefined : backToPicker}
                onDone={() => handleOpenChange(false)}
                step={wizardStep}
                onStepChange={setWizardStep}
              />
            ) : (
              <AlfajorPicker onPick={setSelected} onPropose={openPropose} />
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      <ProposeAlfajorModal open={proposeOpen} onOpenChange={setProposeOpen} />
    </>
  );
}

/**
 * Miniatura redonda del alfajor en el buscador. Muchos alfajores del catálogo
 * todavía no tienen foto, así que el fallback no es una imagen genérica (que
 * haría ver a todos iguales) sino la inicial del nombre sobre un disco: mantiene
 * la alineación de las filas y distingue una de otra.
 */
function AlfajorThumb({
  nombre,
  imagenUrl,
}: {
  nombre: string;
  imagenUrl: string | null;
}) {
  if (!imagenUrl) {
    return (
      <span
        aria-hidden
        className="bg-gris-50 text-deep flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px]"
        style={{ fontFamily: 'var(--font-archivo)' }}
      >
        {nombre.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imagenUrl}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  );
}

function AlfajorPicker({
  onPick,
  onPropose,
}: {
  onPick: (a: Alfajor) => void;
  onPropose: () => void;
}) {
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search, 300).trim();
  const { data, isLoading } = useAlfajores(q ? { q } : {});
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <div className="flex-none px-[18px] pt-3.5 pb-3">
        <h3
          className="text-ink mb-3 text-[18px]"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.03em',
          }}
        >
          ¿Qué probaste?
        </h3>
        <label className="bg-gris-25 border-gris-50 focus-within:border-gris-200 flex h-12 items-center gap-2.5 rounded-[10px] border px-3 transition-colors">
          <Search className="text-gris-300 h-4 w-4" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscá por nombre"
            className="text-ink placeholder:text-gris-300 h-full flex-1 bg-transparent text-[14px] focus:outline-none"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px]">
        {isLoading && (
          <p className="text-gris-400 py-3 text-[13px]">Buscando...</p>
        )}

        {!isLoading && items.length === 0 && q && (
          <p className="text-gris-400 py-3 text-[13px] leading-[1.5]">
            Ningún alfajor coincide con <b className="text-ink">“{q}”</b>.
          </p>
        )}

        <ul className="flex flex-col">
          {items.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onPick(a)}
                className="border-gris-25 hover:bg-gris-25 flex min-h-[56px] w-full items-center gap-3 rounded-[10px] border-t px-1 py-2.5 text-left transition-colors"
              >
                <AlfajorThumb nombre={a.nombre} imagenUrl={a.imagenUrl} />
                <span className="text-ink flex-1 truncate text-[14px] font-medium tracking-[-0.01em]">
                  {a.nombre}
                </span>
                <span
                  className="text-gris-300 shrink-0 text-[10px] tracking-[0.14em] uppercase"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {a.marca?.nombre ?? ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-gris-25 text-gris-400 flex-none border-t px-[18px] pt-3.5 pb-5 text-center text-[13px]">
        ¿No lo encontrás?{' '}
        <button
          type="button"
          onClick={onPropose}
          className="text-cinnamon hover:text-ink font-semibold underline underline-offset-4 transition-colors"
        >
          Solicitá agregarlo
        </button>
      </p>
    </>
  );
}
