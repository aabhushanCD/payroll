import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronDown } from "lucide-react";

import {
  reimbursementSchema,
  type ReimbursementFormData,
} from "../schema/ReimbursementSchema";
import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
  ghostBtn,
} from "../../../common/styles/formStyles";
import { EmployeeSelect } from "../../../common/components/EmployeeSelect";

const EMPTY_VALUES: ReimbursementFormData = {
  employeeId: "",
  type: "ONE_TIME",
  amount: 0,
  label: "",
  taxable: false,
};

type Props = {
  isOpen: boolean;
  isSaving: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (input: ReimbursementFormData) => void;
};

const ReimbursementForm = ({
  isOpen,
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
    watch,
    formState: { errors },
  } = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: EMPTY_VALUES,
  });

  const type = watch("type");

  useEffect(() => {
    if (isOpen) reset(EMPTY_VALUES);
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#233647] bg-[#152331]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
          <h2 className="text-sm font-semibold">Add reimbursement</h2>
          <button
            onClick={onClose}
            className="text-[#7E93A6] hover:text-[#E6ECF1]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Employee</label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <EmployeeSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.employeeId && (
                <p className={errorClass}>{errors.employeeId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Type</label>
                <div className="relative">
                  <select
                    {...register("type")}
                    className={`${fieldClass} appearance-none pr-8`}
                  >
                    <option value="ONE_TIME">One-time</option>
                    <option value="RECURRING">Recurring</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>
                  {type === "RECURRING" ? "Amount per month" : "Amount"}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="3000"
                  className={fieldClass}
                />
                {errors.amount && (
                  <p className={errorClass}>{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Label (optional)</label>
              <input
                {...register("label")}
                placeholder="Client travel, internet bill…"
                className={fieldClass}
              />
              {errors.label && (
                <p className={errorClass}>{errors.label.message}</p>
              )}
            </div>

            <Controller
              control={control}
              name="taxable"
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className="w-full flex items-center justify-between gap-4 rounded-md border border-[#233647] bg-[#0F1B26] px-3 py-2.5 text-left"
                >
                  <div>
                    <div className="text-sm">Taxable</div>
                    <div className="text-xs text-[#7E93A6]">
                      Include in taxable income for TDS
                    </div>
                  </div>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      field.value ? "bg-[#C89B4C]" : "bg-[#233647]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#0F1B26] transition-transform ${
                        field.value ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </span>
                </button>
              )}
            />

            <p className="text-xs text-[#7E93A6]">
              {type === "ONE_TIME"
                ? "Paid in the next payroll run, then marked applied."
                : "Paid every payroll run until you stop it."}
            </p>

            {errorMessage && <p className={errorClass}>{errorMessage}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#233647]">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={primaryBtn}>
              {isSaving ? "Saving…" : "Add reimbursement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReimbursementForm;
