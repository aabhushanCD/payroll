import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import {
  useAllowancesQuery,
  useCreateAllowance,
  useUpdateAllowance,
  useDeleteAllowance,
} from "../hooks/useAllowances";

import type { AllowanceFormData } from "../schema/AllowanceSchema";
import AllowanceForm from "../components/AllowanceForm";
import type { Allowance } from "../types/AllowanceTypes";

const formatAmount = (allowance: Allowance) =>
  allowance.calculationType === "PERCENTAGE"
    ? `${allowance.defaultAmount}%`
    : `Rs.${allowance.defaultAmount.toLocaleString()}`;

// Compact inline switch for the table row — same visual language as the
// form's Toggle, but without the label/description block.
const StatusSwitch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
      checked ? "bg-[#C89B4C]" : "bg-[#233647]"
    }`}
    aria-label={checked ? "Deactivate" : "Activate"}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-[#0F1B26] transition-transform ${
        checked ? "translate-x-4" : "translate-x-1"
      }`}
    />
  </button>
);

const Allowances = () => {
  const {
    data: allowances = [],
    isLoading,
    isError,
    error,
  } = useAllowancesQuery();
  const createAllowance = useCreateAllowance();
  const updateAllowance = useUpdateAllowance();
  const deleteAllowance = useDeleteAllowance();

  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(
    null,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = allowances.filter((a) => {
    const q = query.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingAllowance(null);
    setIsFormOpen(true);
  };

  const openEdit = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAllowance(null);
  };

  const handleSubmit = (data: AllowanceFormData) => {
    if (editingAllowance) {
      updateAllowance.mutate(
        { id: editingAllowance._id, data },
        { onSuccess: closeForm },
      );
    } else {
      createAllowance.mutate(data, { onSuccess: closeForm });
    }
  };

  const toggleActive = (allowance: Allowance) => {
    updateAllowance.mutate({
      id: allowance._id,
      data: { isActive: !allowance.isActive },
    });
  };

  const pendingDeleteAllowance = allowances.find(
    (a) => a._id === pendingDeleteId,
  );

  return (
    <div className="min-h-screen bg-[#0F1B26] text-[#E6ECF1] p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Allowances</h1>
          <p className="text-sm text-[#7E93A6]">
            {isLoading
              ? "Loading…"
              : `${allowances.length} allowance types configured`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#C89B4C] text-[#0F1B26] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} strokeWidth={2} />
          Add allowance
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E93A6]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code"
          className="w-full pl-9 pr-3 py-2 rounded-md bg-[#152331] border border-[#233647] text-sm placeholder:text-[#7E93A6] focus:outline-none focus:border-[#C89B4C]"
        />
      </div>

      {isError && (
        <div className="rounded-md border border-[#3A1E1E] bg-[#1A1010] px-4 py-3 text-sm text-[#E38080]">
          {(error as Error)?.message ?? "Failed to load allowances."}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
              <th className="font-medium px-5 py-3">Name</th>
              <th className="font-medium px-5 py-3">Calculation</th>
              <th className="font-medium px-5 py-3">Amount</th>
              <th className="font-medium px-5 py-3">Taxable</th>
              <th className="font-medium px-5 py-3">Active</th>
              <th className="font-medium px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-[#7E93A6]"
                >
                  Loading allowances…
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((allowance) => (
                <tr
                  key={allowance._id}
                  className={`border-t border-[#233647] hover:bg-[#1B2C3D] transition-colors ${
                    !allowance.isActive ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="leading-tight">
                      <div className="font-medium">{allowance.name}</div>
                      <div className="text-xs text-[#7E93A6]">
                        {allowance.code}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7E93A6]">
                    {allowance.calculationType === "FIXED"
                      ? "Fixed"
                      : "Percentage"}
                  </td>
                  <td className="px-5 py-3">{formatAmount(allowance)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${
                        allowance.taxable
                          ? "bg-[#1B2C3D] text-[#9FB2C2]"
                          : "bg-transparent text-[#7E93A6]"
                      }`}
                    >
                      {allowance.taxable ? "Taxable" : "Non-taxable"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusSwitch
                      checked={allowance.isActive}
                      onChange={() => toggleActive(allowance)}
                      disabled={updateAllowance.isPending}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(allowance)}
                        className="p-1.5 rounded text-[#7E93A6] hover:text-[#E6ECF1] hover:bg-[#233647] transition-colors"
                        aria-label={`Edit ${allowance.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(allowance._id)}
                        className="p-1.5 rounded text-[#7E93A6] hover:text-[#E38080] hover:bg-[#233647] transition-colors"
                        aria-label={`Delete ${allowance.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-[#7E93A6]"
                >
                  {allowances.length === 0
                    ? "No allowances yet."
                    : `No allowances match "${query}"`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AllowanceForm
        isOpen={isFormOpen}
        allowance={editingAllowance}
        isSaving={createAllowance.isPending || updateAllowance.isPending}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      {pendingDeleteAllowance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#233647] bg-[#152331] p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Delete allowance?</h2>
              <p className="text-sm text-[#7E93A6]">
                This will permanently remove{" "}
                <span className="text-[#E6ECF1]">
                  {pendingDeleteAllowance.name}
                </span>
                . If you just want to stop using it, deactivate it instead —
                this can't be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-md text-sm text-[#7E93A6] hover:text-[#E6ECF1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteAllowance.mutate(pendingDeleteAllowance._id, {
                    onSuccess: () => setPendingDeleteId(null),
                  })
                }
                disabled={deleteAllowance.isPending}
                className="px-4 py-2 rounded-md bg-[#E38080] text-[#0F1B26] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {deleteAllowance.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allowances;
