import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { advanceSchema, type AdvanceFormData } from "../schema/AdvanceSchema";

import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
  ghostBtn,
} from "../../../common/styles/formStyles";
import { EmployeeSelect } from "../../../common/components/EmployeeSelect";

const EMPTY_VALUES: AdvanceFormData = {
  employeeId: "",
  amount: 0,
  issuedDate: new Date(),
};

type Props = {
  isOpen: boolean;
  isSaving: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (input: AdvanceFormData) => void;
};

const AdvanceForm = ({
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
    formState: { errors },
  } = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) reset(EMPTY_VALUES);
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#233647] bg-[#152331]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
          <h2 className="text-sm font-semibold">Give advance</h2>
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
            <div className="space-y-1.5 flex">
              <div className="space-y-1.5">
                <label className={labelClass}>Amount (NPR)</label>
                <input
                  type="number"
                  step="any"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="20000"
                  className={fieldClass}
                />
                {errors.amount && (
                  <p className={errorClass}>{errors.amount.message}</p>
                )}
                <p className="text-xs text-[#7E93A6]">
                  Recovered from net pay in upcoming payroll runs, oldest
                  advance first.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Issued Date</label>
                <input
                  type="date"
                  {...register("issuedDate", { valueAsDate: true })}
                  className={fieldClass}
                />
                {errors.issuedDate && (
                  <p className={errorClass}>{errors.issuedDate.message}</p>
                )}
              </div>
            </div>
            {errorMessage && <p className={errorClass}>{errorMessage}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#233647]">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={primaryBtn}>
              {isSaving ? "Saving…" : "Give advance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceForm;
