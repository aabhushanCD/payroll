import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { X, ChevronDown } from "lucide-react";

import type { AllowanceFormData } from "../schema/AllowanceSchema";
import type { Allowance } from "../types/AllowanceTypes";
import {
  errorClass,
  fieldClass,
  labelClass,
} from "../../../common/styles/formStyles";

const CALCULATION_TYPES: AllowanceFormData["calculationType"][] = [
  "FIXED",
  "PERCENTAGE",
];

const EMPTY_VALUES: AllowanceFormData = {
  name: "",
  code: "",
  calculationType: "FIXED",
  defaultAmount: 0,
  taxable: true,
  isActive: true,
  isSecret: false,
};

type Props = {
  isOpen: boolean;
  allowance: Allowance | null; // null = create mode
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: AllowanceFormData) => void;
};

// Small reusable toggle so taxable/isActive/isSecret read as switches, not checkboxes.
const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 rounded-md border border-[#233647] bg-[#0F1B26] px-3 py-2.5 text-left"
  >
    <div>
      <div className="text-sm">{label}</div>
      <div className="text-xs text-[#7E93A6]">{description}</div>
    </div>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-[#C89B4C]" : "bg-[#233647]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#0F1B26] transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </span>
  </button>
);

const AllowanceForm = ({
  isOpen,
  allowance,
  isSaving,
  onClose,
  onSubmit,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AllowanceFormData>({ defaultValues: EMPTY_VALUES });

  const calculationType = useWatch({ control, name: "calculationType" });

  useEffect(() => {
    if (isOpen) {
      reset(allowance ? { ...allowance } : EMPTY_VALUES);
    }
  }, [isOpen, allowance, reset]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#233647] bg-[#152331]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
          <h2 className="text-sm font-semibold">
            {allowance ? "Edit allowance" : "Add allowance"}
          </h2>
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
              <label className={labelClass}>Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Transport Allowance"
                className={fieldClass}
              />
              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Code</label>
              <input
                {...register("code", { required: "Code is required" })}
                placeholder="TRANSPORT_ALW"
                className={fieldClass}
              />
              {errors.code && (
                <p className={errorClass}>{errors.code.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Calculation type</label>
                <div className="relative">
                  <select
                    {...register("calculationType")}
                    className={`${fieldClass} appearance-none pr-8`}
                  >
                    {CALCULATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === "FIXED" ? "Fixed" : "Percentage"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>
                  {calculationType === "PERCENTAGE" ? "Amount (%)" : "Amount"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    {...register("defaultAmount", {
                      required: "Amount is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Amount can't be negative" },
                      validate: (value) =>
                        calculationType === "PERCENTAGE" && value > 100
                          ? "Percentage-based amount can't exceed 100"
                          : true,
                    })}
                    placeholder={
                      calculationType === "PERCENTAGE" ? "10" : "2000"
                    }
                    className={`${fieldClass} ${
                      calculationType === "PERCENTAGE" ? "pr-7" : ""
                    }`}
                  />
                  {calculationType === "PERCENTAGE" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E93A6]">
                      %
                    </span>
                  )}
                </div>
                {errors.defaultAmount && (
                  <p className={errorClass}>{errors.defaultAmount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Controller
                control={control}
                name="taxable"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Taxable"
                    description="Include this allowance in taxable income"
                  />
                )}
              />
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Active"
                    description="Available for assignment on payroll runs"
                  />
                )}
              />
              <Controller
                control={control}
                name="isSecret"
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Secret"
                    description="Only visible to payroll admins and superadmins"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#233647]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-[#7E93A6] hover:text-[#E6ECF1] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-[#C89B4C] text-[#0F1B26] text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isSaving
                ? "Saving…"
                : allowance
                  ? "Save changes"
                  : "Add allowance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllowanceForm;
