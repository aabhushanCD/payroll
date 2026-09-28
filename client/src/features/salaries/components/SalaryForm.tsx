import { useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";

import type { SalaryFormData } from "../schema/SalarySchema";
import type { Salary } from "../types/types";
import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
  ghostBtn,
} from "../../../common/styles/formStyles";
import { useAllowancesQuery } from "../../allowance/hooks/useAllowances";
import { EmployeeSelect } from "../../../common/components/EmployeeSelect";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_VALUES: SalaryFormData = {
  employeeId: "",
  basicSalary: 0,
  effectiveDate: today(),
  allowances: [],
};

type Props = {
  isOpen: boolean;
  revising: Salary | null; // null = assign to a new employee
  isSaving: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (input: SalaryFormData) => void;
};

const idOf = (v: string | { _id: string }) =>
  typeof v === "string" ? v : v._id;

const SalaryForm = ({
  isOpen,
  revising,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: Props) => {
  const { data: allowances = [] } = useAllowancesQuery();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SalaryFormData>({ defaultValues: EMPTY_VALUES });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowances",
  });
  const rows = useWatch({ control, name: "allowances" });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      revising
        ? {
            employeeId: idOf(revising.employeeId),
            basicSalary: revising.basicSalary,
            effectiveDate: today(), // new version starts today by default
            allowances: revising.allowances.map((a) => ({
              allowance: idOf(a.allowance),
              amount: a.amount,
            })),
          }
        : { ...EMPTY_VALUES, effectiveDate: today() },
    );
  }, [isOpen, revising, reset]);

  if (!isOpen) return null;

  const findAllowance = (id: string) => allowances.find((a) => a._id === id);
  const takenIds = (rows ?? []).map((r) => r.allowance);
  const selectable = allowances.filter((a) => a.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-lg border border-[#233647] bg-[#152331]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
          <h2 className="text-sm font-semibold">
            {revising ? "Revise salary (new version)" : "Assign salary"}
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
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="space-y-1.5">
              <label className={labelClass}>Employee</label>
              <Controller
                control={control}
                name="employeeId"
                rules={{ required: "Select an employee" }}
                render={({ field }) => (
                  <EmployeeSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!revising}
                  />
                )}
              />
              {errors.employeeId && (
                <p className={errorClass}>{errors.employeeId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Basic salary (NPR)</label>
                <input
                  type="number"
                  step="any"
                  {...register("basicSalary", {
                    required: "Basic salary is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Can't be negative" },
                  })}
                  placeholder="50000"
                  className={fieldClass}
                />
                {errors.basicSalary && (
                  <p className={errorClass}>{errors.basicSalary.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Effective date</label>
                <input
                  type="date"
                  {...register("effectiveDate", {
                    required: "Effective date is required",
                  })}
                  className={fieldClass}
                />
                {errors.effectiveDate && (
                  <p className={errorClass}>{errors.effectiveDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Allowances</label>
                <button
                  type="button"
                  onClick={() => append({ allowance: "", amount: 0 })}
                  className="flex items-center gap-1 text-xs text-[#C89B4C] hover:opacity-80"
                >
                  <Plus size={12} /> Add allowance
                </button>
              </div>

              {fields.length === 0 && (
                <p className="text-xs text-[#7E93A6]">
                  No allowances. Basic salary only.
                </p>
              )}

              {fields.map((field, i) => {
                const picked = findAllowance(rows?.[i]?.allowance ?? "");
                return (
                  <div
                    key={field.id}
                    className="rounded-md border border-[#233647] bg-[#0F1B26]/40 p-2.5 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative flex-1">
                        <select
                          {...register(`allowances.${i}.allowance`, {
                            required: "Select an allowance",
                            validate: (v) =>
                              getValues("allowances").filter(
                                (r) => r.allowance === v,
                              ).length === 1 || "Already added",
                            onChange: (e) => {
                              const a = findAllowance(e.target.value);
                              // pre-fill only; the user can still change it, including to 0
                              if (a)
                                setValue(
                                  `allowances.${i}.amount`,
                                  a.defaultAmount ?? 0,
                                );
                            },
                          })}
                          className={`${fieldClass} appearance-none pr-8`}
                        >
                          <option value="">Select allowance</option>
                          {selectable
                            .filter(
                              (a) =>
                                a._id === rows?.[i]?.allowance ||
                                !takenIds.includes(a._id),
                            )
                            .map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.name} ({a.code})
                              </option>
                            ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
                        />
                      </div>

                      <input
                        type="number"
                        step="any"
                        {...register(`allowances.${i}.amount`, {
                          required: "Required",
                          valueAsNumber: true,
                          min: { value: 0, message: "Can't be negative" },
                        })}
                        className={`${fieldClass} w-28`}
                      />

                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="mt-2 text-[#7E93A6] hover:text-[#E38080]"
                        aria-label="Remove allowance"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {picked?.isSecret && (
                        <span className="rounded-full bg-[#E38080]/15 px-2 py-0.5 text-[#E38080]">
                          Secret
                        </span>
                      )}
                      {picked && !picked.taxable && (
                        <span className="text-[#7E93A6]">Non-taxable</span>
                      )}
                      {picked?.calculationType === "PERCENTAGE" && (
                        <span className="text-[#7E93A6]">
                          Default was {picked.defaultAmount}% - enter the NPR
                          amount
                        </span>
                      )}
                    </div>

                    {(errors.allowances?.[i]?.allowance ||
                      errors.allowances?.[i]?.amount) && (
                      <p className={errorClass}>
                        {errors.allowances?.[i]?.allowance?.message ??
                          errors.allowances?.[i]?.amount?.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {errorMessage && <p className={errorClass}>{errorMessage}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#233647]">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={primaryBtn}>
              {isSaving
                ? "Saving…"
                : revising
                  ? "Save new version"
                  : "Assign salary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryForm;
