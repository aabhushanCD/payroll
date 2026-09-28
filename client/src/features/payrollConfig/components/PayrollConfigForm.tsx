import { useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";

import {
  payrollConfigSchema,
  configToForm,
  DEFAULT_SLABS,
  type PayrollConfigFormData,
} from "../schema/PayrollConfigSchema";
import type { PayrollConfig } from "../types/types";
import { formatNPR } from "../../../common/lib/format";
import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
  ghostBtn,
} from "../../../common/styles/formStyles";

const EMPTY_VALUES: PayrollConfigFormData = {
  fiscalYear: "",
  effectiveFrom: "",
  ssfEmployeeRate: 11,
  ssfEmployerRate: 20,
  securityFundRate: 1,
  overtimeMultiplier: 1.5,
  taxSlabs: DEFAULT_SLABS,
};

type Props = {
  isOpen: boolean;
  config: PayrollConfig | null; // null = create mode
  isSaving: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (input: PayrollConfigFormData) => void;
};

const PercentField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className={labelClass}>{label}</label>
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E93A6]">
        %
      </span>
    </div>
    {error && <p className={errorClass}>{error}</p>}
  </div>
);

const PayrollConfigForm = ({
  isOpen,
  config,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PayrollConfigFormData>({
    resolver: zodResolver(payrollConfigSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, insert, remove } = useFieldArray({
    control,
    name: "taxSlabs",
  });
  const slabs = useWatch({ control, name: "taxSlabs" });

  useEffect(() => {
    if (isOpen) reset(config ? configToForm(config) : EMPTY_VALUES);
  }, [isOpen, config, reset]);

  if (!isOpen) return null;

  // The last row is always the open-ended top slab. New slabs go above it.
  const addSlab = () => {
    const prev = slabs[slabs.length - 2]?.upTo ?? 0;
    insert(fields.length - 1, { upTo: prev + 1_000_000, rate: 0 });
  };

  const slabsError =
    errors.taxSlabs?.root?.message ??
    (errors.taxSlabs as { message?: string } | undefined)?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-[#233647] bg-[#152331]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
          <h2 className="text-sm font-semibold">
            {config ? `Edit ${config.fiscalYear}` : "Add fiscal year config"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#7E93A6] hover:text-[#E6ECF1]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0"
        >
          <div className="p-5 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Fiscal year</label>
                <input
                  {...register("fiscalYear")}
                  disabled={!!config}
                  placeholder="2083/84"
                  className={`${fieldClass} disabled:opacity-50`}
                />
                {errors.fiscalYear && (
                  <p className={errorClass}>{errors.fiscalYear.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Effective from</label>
                <input
                  type="date"
                  {...register("effectiveFrom")}
                  className={fieldClass}
                />
                {errors.effectiveFrom && (
                  <p className={errorClass}>{errors.effectiveFrom.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PercentField
                label="SSF employee"
                error={errors.ssfEmployeeRate?.message}
              >
                <input
                  type="number"
                  step="any"
                  {...register("ssfEmployeeRate", { valueAsNumber: true })}
                  className={`${fieldClass} pr-7`}
                />
              </PercentField>
              <PercentField
                label="SSF employer"
                error={errors.ssfEmployerRate?.message}
              >
                <input
                  type="number"
                  step="any"
                  {...register("ssfEmployerRate", { valueAsNumber: true })}
                  className={`${fieldClass} pr-7`}
                />
              </PercentField>
              <PercentField
                label="Security fund"
                error={errors.securityFundRate?.message}
              >
                <input
                  type="number"
                  step="any"
                  {...register("securityFundRate", { valueAsNumber: true })}
                  className={`${fieldClass} pr-7`}
                />
              </PercentField>
              <div className="space-y-1.5">
                <label className={labelClass}>Overtime multiplier</label>
                <input
                  type="number"
                  step="any"
                  {...register("overtimeMultiplier", { valueAsNumber: true })}
                  className={fieldClass}
                />
                {errors.overtimeMultiplier && (
                  <p className={errorClass}>
                    {errors.overtimeMultiplier.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Annual tax slabs</label>
                <button
                  type="button"
                  onClick={addSlab}
                  className="flex items-center gap-1 text-xs text-[#C89B4C] hover:opacity-80"
                >
                  <Plus size={12} /> Add slab
                </button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_6rem_1.5rem] gap-2 text-xs text-[#7E93A6]">
                <span>From</span>
                <span>Up to (cumulative)</span>
                <span>Rate</span>
                <span />
              </div>

              {fields.map((field, i) => {
                const isLast = i === fields.length - 1;
                const from = i === 0 ? 0 : (slabs?.[i - 1]?.upTo ?? 0);
                return (
                  <div key={field.id} className="space-y-1">
                    <div className="grid grid-cols-[1fr_1fr_6rem_1.5rem] items-center gap-2">
                      <div className={`${fieldClass} opacity-60`}>
                        {formatNPR(from)}
                      </div>

                      <Controller
                        control={control}
                        name={`taxSlabs.${i}.upTo`}
                        render={({ field: f }) => (
                          <input
                            type="number"
                            step="any"
                            disabled={isLast}
                            value={isLast ? "" : (f.value ?? "")}
                            onChange={(e) =>
                              f.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                            placeholder={isLast ? "No limit" : "1500000"}
                            className={`${fieldClass} disabled:opacity-60`}
                          />
                        )}
                      />

                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          {...register(`taxSlabs.${i}.rate`, {
                            valueAsNumber: true,
                          })}
                          className={`${fieldClass} pr-7`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E93A6]">
                          %
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={fields.length === 1 || isLast}
                        onClick={() => remove(i)}
                        className="text-[#7E93A6] hover:text-[#E38080] disabled:opacity-30 disabled:hover:text-[#7E93A6]"
                        aria-label="Remove slab"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {(errors.taxSlabs?.[i]?.upTo ||
                      errors.taxSlabs?.[i]?.rate) && (
                      <p className={errorClass}>
                        {errors.taxSlabs?.[i]?.upTo?.message ??
                          errors.taxSlabs?.[i]?.rate?.message}
                      </p>
                    )}
                  </div>
                );
              })}

              {slabsError && <p className={errorClass}>{slabsError}</p>}
              <p className="text-xs text-[#7E93A6]">
                Each ceiling is cumulative annual income. Each rate applies only
                to the portion inside its slab.
              </p>
            </div>

            {errorMessage && <p className={errorClass}>{errorMessage}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#233647]">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={primaryBtn}>
              {isSaving ? "Saving…" : config ? "Save changes" : "Add config"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollConfigForm;
