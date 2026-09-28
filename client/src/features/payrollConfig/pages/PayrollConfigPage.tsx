import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import PayrollConfigForm from "../components/PayrollConfigForm";
import {
  useCreateConfig,
  useCurrentConfig,
  useDeleteConfig,
  usePayrollConfigs,
  useUpdateConfig,
} from "../hooks/usePayrollConfig";
import type { PayrollConfig } from "../types/types";
import type { PayrollConfigFormData } from "../schema/PayrollConfigSchema";
import { formatDate } from "../../../common/lib/format";
import { primaryBtn } from "../../../common/styles/formStyles";

const PayrollConfigPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PayrollConfig | null>(null);

  const { data: configs = [], isLoading } = usePayrollConfigs();
  const { data: current } = useCurrentConfig();
  const create = useCreateConfig();
  const update = useUpdateConfig();
  const remove = useDeleteConfig();

  const saving = create.isPending || update.isPending;
  const err = (create.error ?? update.error) as Error | null;

  const close = () => {
    setIsOpen(false);
    setEditing(null);
    create.reset();
    update.reset();
  };

  const submit = (data: PayrollConfigFormData) =>
    editing
      ? update.mutate({ id: editing._id, data }, { onSuccess: close })
      : create.mutate(data, { onSuccess: close });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Payroll config</h1>
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryBtn} flex items-center gap-1.5`}
        >
          <Plus size={14} /> Add fiscal year
        </button>
      </div>

      {!isLoading && !current && (
        <div className="rounded-md border border-[#C89B4C]/40 bg-[#C89B4C]/10 px-4 py-3 text-sm text-[#C89B4C]">
          No config is effective for today. Payroll runs will fail until one
          exists.
        </div>
      )}

      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
            <tr>
              <th className="px-4 py-3 font-medium">Fiscal year</th>
              <th className="px-4 py-3 font-medium">Effective from</th>
              <th className="px-4 py-3 font-medium">SSF (emp / er)</th>
              <th className="px-4 py-3 font-medium">Security fund</th>
              <th className="px-4 py-3 font-medium">OT ×</th>
              <th className="px-4 py-3 font-medium">Slabs</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-[#7E93A6]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && configs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-[#7E93A6]">
                  No configs yet. Run <code>npm run seed</code> on the server or
                  add one.
                </td>
              </tr>
            )}
            {configs.map((c) => (
              <tr
                key={c._id}
                className="border-b border-[#233647] last:border-0"
              >
                <td className="px-4 py-3">
                  {c.fiscalYear}
                  {current?._id === c._id && (
                    <span className="ml-2 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                      Current
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(c.effectiveFrom)}</td>
                <td className="px-4 py-3">
                  {c.ssfEmployeeRate} / {c.ssfEmployerRate}
                </td>
                <td className="px-4 py-3">{c.securityFundRate}</td>
                <td className="px-4 py-3">{c.overtimeMultiplier}</td>
                <td className="px-4 py-3">{c.taxSlabs.length}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-[#7E93A6]">
                    <button
                      title="Edit"
                      onClick={() => {
                        setEditing(c);
                        setIsOpen(true);
                      }}
                      className="hover:text-[#E6ECF1]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() =>
                        confirm(`Delete ${c.fiscalYear}?`) &&
                        remove.mutate(c._id)
                      }
                      className="hover:text-[#E38080]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PayrollConfigForm
        isOpen={isOpen}
        config={editing}
        isSaving={saving}
        errorMessage={err?.message}
        onClose={close}
        onSubmit={submit}
      />
    </div>
  );
};

export default PayrollConfigPage;
