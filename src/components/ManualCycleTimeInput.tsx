/**
 * ManualCycleTimeInput.tsx
 *
 * Propósito: Campo segmentado Min : Seg . Cs para tiempos de ciclo manuales.
 *
 * Responsabilidades:
 * - Mostrar el formato precargado y facilitar la captura táctil por segmento.
 * - Emitir siempre una cadena MM:SS.CS compatible con el parser de dominio.
 *
 * Rol en la arquitectura: Componente de UI especializado del formulario manual.
 */

import { useCallback, useRef, type KeyboardEvent } from 'react';
import {
  joinCycleTimeParts,
  MANUAL_CYCLE_TIME_SEGMENTS,
  splitCycleTimeInput,
  type ManualCycleTimeParts,
} from '../utils/manualCycleTimeInput';

export interface ManualCycleTimeInputProps {
  readonly id: string;
  readonly value: string;
  readonly disabled?: boolean;
  readonly hasError?: boolean;
  readonly onChange: (value: string) => void;
}

type TimeSegment = keyof ManualCycleTimeParts;

const SEGMENT_CONFIG: ReadonlyArray<{
  readonly key: TimeSegment;
  readonly label: (typeof MANUAL_CYCLE_TIME_SEGMENTS)[number];
  readonly maxLength: number;
  readonly widthClass: string;
  readonly ariaLabel: string;
}> = [
  {
    key: 'minutes',
    label: 'Min',
    maxLength: 3,
    widthClass: 'w-14 sm:w-16',
    ariaLabel: 'Minutos',
  },
  {
    key: 'seconds',
    label: 'Seg',
    maxLength: 2,
    widthClass: 'w-12 sm:w-14',
    ariaLabel: 'Segundos',
  },
  {
    key: 'centiseconds',
    label: 'Cs',
    maxLength: 2,
    widthClass: 'w-12 sm:w-14',
    ariaLabel: 'Centésimas',
  },
];

export function ManualCycleTimeInput({
  id,
  value,
  disabled = false,
  hasError = false,
  onChange,
}: ManualCycleTimeInputProps): React.JSX.Element {
  const secondsRef = useRef<HTMLInputElement>(null);
  const centisecondsRef = useRef<HTMLInputElement>(null);
  const parts = splitCycleTimeInput(value);

  const handleSegmentChange = useCallback(
    (segment: TimeSegment, nextValue: string): void => {
      const digits = nextValue.replace(/\D/g, '').slice(
        0,
        segment === 'minutes' ? 3 : 2,
      );

      const updated: ManualCycleTimeParts = {
        ...parts,
        [segment]: digits,
      };

      onChange(joinCycleTimeParts(updated));

      if (segment === 'minutes' && digits.length >= 2) {
        secondsRef.current?.focus();
        secondsRef.current?.select();
      }

      if (segment === 'seconds' && digits.length >= 2) {
        centisecondsRef.current?.focus();
        centisecondsRef.current?.select();
      }
    },
    [onChange, parts],
  );

  const handleSegmentKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    segment: TimeSegment,
  ): void => {
    if (event.key !== 'Backspace') {
      return;
    }

    const currentValue = parts[segment];

    if (currentValue.length > 0) {
      return;
    }

    if (segment === 'seconds') {
      event.preventDefault();
      document.getElementById(`${id}-minutes`)?.focus();
    }

    if (segment === 'centiseconds') {
      event.preventDefault();
      secondsRef.current?.focus();
    }
  };

  const borderClass = hasError
    ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/30 dark:border-rose-500/50'
    : 'border-zinc-300 focus-within:border-emerald-500 focus-within:ring-emerald-500/30 dark:border-zinc-700';

  return (
    <div className="space-y-1.5">
      <div
        className={[
          'flex min-h-12 items-center justify-center gap-1 rounded-xl border bg-white px-2 transition-all duration-200 focus-within:ring-2 sm:gap-1.5 sm:px-3',
          'dark:bg-zinc-950',
          borderClass,
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        {SEGMENT_CONFIG.map((segment, index) => (
          <div key={segment.key} className="flex items-center gap-1 sm:gap-1.5">
            {index > 0 && (
              <span
                className="pb-0.5 font-mono text-base font-bold text-zinc-400 dark:text-zinc-500"
                aria-hidden="true"
              >
                {index === 1 ? ':' : '.'}
              </span>
            )}

            <div className="flex flex-col items-center">
              <input
                id={`${id}-${segment.key}`}
                ref={
                  segment.key === 'seconds'
                    ? secondsRef
                    : segment.key === 'centiseconds'
                      ? centisecondsRef
                      : undefined
                }
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                disabled={disabled}
                value={parts[segment.key]}
                maxLength={segment.maxLength}
                aria-label={segment.ariaLabel}
                onChange={(event) =>
                  handleSegmentChange(segment.key, event.target.value)
                }
                onKeyDown={(event) => handleSegmentKeyDown(event, segment.key)}
                onFocus={(event) => event.target.select()}
                className={[
                  segment.widthClass,
                  'rounded-lg bg-transparent text-center font-mono text-sm font-bold text-zinc-900',
                  'focus:outline-none dark:text-zinc-50',
                ].join(' ')}
              />
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {segment.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        Formato: Min : Seg . Cs (centésimas)
      </p>
    </div>
  );
}
