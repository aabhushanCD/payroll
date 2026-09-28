import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, ChevronDown } from "lucide-react";
import { type EmployeeFormData } from "../schema/EmployeeSchema";
import type {
  Employee,
  EmploymentType,
  SSF_STATUS,
  Status,
} from "../types/types";
import { toDateInputValue } from "../../../common/lib/toDateInputValue";

const DEPARTMENTS = ["Finance", "Engineering", "People", "Design", "Sales"];
const STATUSES: Status[] = ["ACTIVE", "ON_LEAVE", "Terminated"];
const SSF_STATUSES: SSF_STATUS[] = ["SSF", "NON_SSF"];
const EMPLOYEE_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT"];

const EMPTY_VALUES: EmployeeFormData = {
  name: "",
  employeeCode: "",
  joiningDate: toDateInputValue(new Date().toISOString()), // default to today
  employmentType: EMPLOYEE_TYPES[0],
  designation: DEPARTMENTS[0],
  ssfStatus: SSF_STATUSES[0],
  payRate: 1.5,
  status: "ACTIVE",
  bank: {
    name: "",
    accountNumber: "",
    branch: "",
  },
};

type Props = {
  isOpen: boolean;
  employee: Employee | null; // null = create mode
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: EmployeeFormData) => void;
};

// Shared field chrome so every input/select in the form stays consistent.
const fieldClass =
  "w-full px-3 py-2 rounded-md bg-[#0F1B26] border border-[#233647] text-sm placeholder:text-[#7E93A6] focus:outline-none focus:border-[#C89B4C]";
const labelClass = "text-xs font-medium text-[#7E93A6]";
const errorClass = "text-xs text-[#E38080]";

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#C89B4C]">
    {children}
  </h3>
);

const EmployeeFormModal = ({
  isOpen,
  employee,
  isSaving,
  onClose,
  onSubmit,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        employee
          ? { ...employee, joiningDate: toDateInputValue(employee.joiningDate) }
          : EMPTY_VALUES,
      );
    }
  }, [isOpen, employee, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      {/* Click outside to close */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative flex h-screen w-full max-w-lg flex-col bg-[#152331] border-l border-[#233647]">
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#233647] shrink-0">
          <h2 className="text-sm font-semibold">
            {employee ? "Edit employee" : "Add employee"}
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
          className="flex flex-1 min-h-0 flex-col"
        >
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Basic info */}
            <div className="space-y-4">
              <SectionHeading>Basic info</SectionHeading>

              <div className="space-y-1.5">
                <label className={labelClass}>Full name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  placeholder="Jane Cooper"
                  className={fieldClass}
                />
                {errors.name && (
                  <p className={errorClass}>{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Employee code</label>
                  <input
                    {...register("employeeCode", {
                      required: "Employee code is required",
                    })}
                    placeholder="EMP-001"
                    className={fieldClass}
                  />
                  {errors.employeeCode && (
                    <p className={errorClass}>{errors.employeeCode.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Designation</label>
                  <input
                    {...register("designation", {
                      required: "Designation is required",
                    })}
                    placeholder="Software Engineer"
                    className={fieldClass}
                  />
                  {errors.designation && (
                    <p className={errorClass}>{errors.designation.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className="space-y-4 pt-6 border-t border-[#233647]">
              <SectionHeading>Employment</SectionHeading>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Joining date</label>
                  <input
                    type="date"
                    {...register("joiningDate", {
                      required: "Joining date is required",
                    })}
                    className={fieldClass}
                  />
                  {errors.joiningDate && (
                    <p className={errorClass}>{errors.joiningDate.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Employee type</label>
                  <div className="relative">
                    <select
                      {...register("employmentType")}
                      className={`${fieldClass} appearance-none pr-8`}
                    >
                      {EMPLOYEE_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
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
                  <label className={labelClass}>Status</label>
                  <div className="relative">
                    <select
                      {...register("status")}
                      className={`${fieldClass} appearance-none pr-8`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
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
                  <label className={labelClass}>SSF status</label>
                  <div className="relative">
                    <select
                      {...register("ssfStatus")}
                      className={`${fieldClass} appearance-none pr-8`}
                    >
                      {SSF_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Pay rate</label>
                <input
                  {...register("payRate", {
                    required: "Pay rate is required",
                  })}
                  placeholder="1.5x"
                  className={fieldClass}
                />
                {errors.payRate && (
                  <p className={errorClass}>{errors.payRate.message}</p>
                )}
              </div>
            </div>

            {/* Bank details */}
            <div className="space-y-4 pt-6 border-t border-[#233647]">
              <SectionHeading>Bank details</SectionHeading>

              <div className="space-y-1.5">
                <label className={labelClass}>Bank name</label>
                <input
                  {...register("bank.name", {
                    required: "Bank name is required",
                  })}
                  placeholder="SBI"
                  className={fieldClass}
                />
                {errors.bank?.name && (
                  <p className={errorClass}>{errors.bank.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Account number</label>
                  <input
                    {...register("bank.accountNumber", {
                      required: "Account number is required",
                    })}
                    placeholder="1234567890"
                    className={fieldClass}
                  />
                  {errors.bank?.accountNumber && (
                    <p className={errorClass}>
                      {errors.bank.accountNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Branch</label>
                  <input
                    {...register("bank.branch", {
                      required: "Branch is required",
                    })}
                    placeholder="Main Branch"
                    className={fieldClass}
                  />
                  {errors.bank?.branch && (
                    <p className={errorClass}>{errors.bank.branch.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#233647] shrink-0">
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
                : employee
                  ? "Save changes"
                  : "Add employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
