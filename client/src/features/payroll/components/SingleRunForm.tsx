import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  singleRunSchema,
  type SingleRunFormData,
} from "../schema/PayrollRunSchema";
import EmployeeContextPanel from "./EmployeeContextPanel";
import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
} from "../../../common/styles/formStyles";
import { formatNPR } from "../../../common/lib/format";
import type { PayrollRun } from "../types";
import { EmployeeSelect } from "../../../common/components/EmployeeSelect";

const EMPTY_VALUES: SingleRunFormData = {
  employeeId: "",
  periodMonth: new Date().toISOString().slice(0, 7),
  hoursWorked: 0,
  advanceMode: "AUTO",
  requestedAdvanceRecovery: 0,
};

type Props = {
  isRunning: boolean;
  errorMessage?: string;
  result?: PayrollRun;
  onRun: (input: SingleRunFormData) => void;
};

const SingleRunForm = ({ isRunning, errorMessage, result, onRun }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SingleRunFormData>({
    resolver: zodResolver(singleRunSchema),
    defaultValues: EMPTY_VALUES,
  });

  const employeeId = watch("employeeId");
  const advanceMode = watch("advanceMode");

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4">
      <form onSubmit={handleSubmit(onRun)} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Employee</label>
          <Controller
            control={control}
            name="employeeId"
            render={({ field }) => (
              <EmployeeSelect value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.employeeId && (
            <p className={errorClass}>{errors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Period</label>
            <input
              type="month"
              {...register("periodMonth")}
              className={fieldClass}
            />
            {errors.periodMonth && (
              <p className={errorClass}>{errors.periodMonth.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Overtime hours</label>
            <input
              type="number"
              step="any"
              {...register("hoursWorked", { valueAsNumber: true })}
              className={fieldClass}
            />
            {errors.hoursWorked && (
              <p className={errorClass}>{errors.hoursWorked.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Advance recovery</label>
          <div className="flex gap-2">
            {(
              [
                ["AUTO", "As much as net pay allows"],
                ["FIXED", "Fixed amount"],
                ["SKIP", "Skip this run"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-xs text-center transition-colors ${
                  advanceMode === value
                    ? "border-[#C89B4C] text-[#C89B4C] bg-[#C89B4C]/10"
                    : "border-[#233647] text-[#7E93A6]"
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  {...register("advanceMode")}
                  className="hidden"
                />
                {label}
              </label>
            ))}
          </div>
          {advanceMode === "FIXED" && (
            <input
              type="number"
              step="any"
              {...register("requestedAdvanceRecovery", { valueAsNumber: true })}
              placeholder="5000"
              className={`${fieldClass} mt-2`}
            />
          )}
        </div>

        {errorMessage && <p className={errorClass}>{errorMessage}</p>}

        <button type="submit" disabled={isRunning} className={primaryBtn}>
          {isRunning ? "Running…" : "Run payroll"}
        </button>

        {result && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4 text-sm space-y-1">
            <p className="text-green-400 font-medium">Payroll run complete</p>
            <div className="flex justify-between">
              <span className="text-[#7E93A6]">Net pay</span>
              <span>{formatNPR(result.netPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7E93A6]">Employer cost</span>
              <span>{formatNPR(result.employerCost)}</span>
            </div>
          </div>
        )}
      </form>

      <EmployeeContextPanel employeeId={employeeId} />
    </div>
  );
};

export default SingleRunForm;
