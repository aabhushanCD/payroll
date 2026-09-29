import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import {
  batchRunSchema,
  type BatchRunFormData,
} from "../schema/PayrollRunSchema";
import {
  fieldClass,
  labelClass,
  errorClass,
  primaryBtn,
} from "../../../common/styles/formStyles";

const EMPTY_VALUES: BatchRunFormData = {
  periodMonth: new Date().toISOString().slice(0, 7),
  ssfStatus: "ALL",
};

type Props = {
  isRunning: boolean;
  errorMessage?: string;
  onRun: (input: BatchRunFormData) => void;
};

const BatchRunForm = ({ isRunning, errorMessage, onRun }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BatchRunFormData>({
    resolver: zodResolver(batchRunSchema),
    defaultValues: EMPTY_VALUES,
  });

  return (
    <form onSubmit={handleSubmit(onRun)} className="max-w-md space-y-4">
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
        <label className={labelClass}>Employee group</label>
        <div className="relative">
          <select
            {...register("ssfStatus")}
            className={`${fieldClass} appearance-none pr-8`}
          >
            <option value="ALL">All employees</option>
            <option value="SSF">SSF only</option>
            <option value="NON_SSF">Non-SSF only</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
          />
        </div>
      </div>

      <p className="text-xs text-[#7E93A6]">
        Overtime hours default to 0 for everyone in a batch run. Run those
        employees individually first if they worked overtime.
      </p>

      {errorMessage && <p className={errorClass}>{errorMessage}</p>}

      <button type="submit" disabled={isRunning} className={primaryBtn}>
        {isRunning ? "Running…" : "Run payroll for group"}
      </button>
    </form>
  );
};

export default BatchRunForm;
