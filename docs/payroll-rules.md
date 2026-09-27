# Payroll Rules & Specification — Nepal Payroll Module (FY 2083/84)

This document is the single source of truth for the payroll calculation engine.
No calculation logic should be written until the case it implements is covered here.
When a rule below is an *assumption* (not stated explicitly in the assignment), it is
marked **[ASSUMPTION]** and repeated in the README.

---

## 1. Employee Model

| Field | Type | Notes |
|---|---|---|
| employeeId | string | unique |
| name | string | |
| department / designation | string | |
| employmentType | `SSF` \| `NON_SSF` | drives all branching below |
| basicPay | number (monthly, NPR) | |
| joiningDate | date | |
| bankDetails | { bankName, accountNumber } | dummy data |

---

## 2. Earnings — line items and taxability/SSF-contributory status

| Earning | Recurs? | Taxable? | SSF-contributory? | Visible on employee payslip? |
|---|---|---|---|---|
| Basic Pay | every cycle | yes | yes (base for SSF %) | yes |
| Dearness Allowance | every cycle (fixed) | yes | no **[ASSUMPTION: only Basic is the SSF base, per assignment's "31% of basic pay"]** | yes |
| Conveyance | every cycle (fixed) | yes | no | yes |
| Dynamic Allowance(s) | every cycle, admin-managed, no schema change | yes | no | yes |
| Overtime | per cycle, if logged | yes | no | yes |
| One-time Reimbursement | single cycle only, auto-expires after use | **no [ASSUMPTION: reimbursements are expense repayments, not income]** | no | yes |
| Recurring Reimbursement | every cycle until explicitly stopped | no | no | yes |
| Secret Salary | every cycle | **no (excluded entirely)** | **no (excluded entirely)** | **NEVER** — admin cost view only |

**Dynamic allowance data shape** (no schema change to add a new one):
```json
{ "name": "Transport Allowance", "amount": 2000 }
```
Stored as an array on the employee's salary profile, not as named columns.

---

## 3. Deductions

### 3.1 SSF (SSF-registered employees only)
```
Employee SSF = 11% × Basic Pay   → deducted from employee, shown on payslip
Employer SSF = 20% × Basic Pay   → NOT deducted from employee; recorded as employer cost
```
Non-SSF employees: both = 0, and (per assignment) their tax is computed with **no SSF-linked exemption** — i.e., taxable income = gross earnings minus nothing SSF-related.

### 3.2 Income Tax (TDS) — progressive slabs, FY 2083/84
| Annual taxable income (NPR) | Rate |
|---|---|
| Up to 10,00,000 | 1% |
| Next 5,00,000 (10,00,001–15,00,000) | 10% |
| Next 10,00,000 (15,00,001–25,00,000) | 20% |
| Next 15,00,000 (25,00,001–40,00,000) | 27% |
| Above 40,00,000 | 29% |

Slabs live in a versioned `TaxConfig` table keyed by fiscal year — never hardcoded, since they change annually.

**Monthly TDS method — [ASSUMPTION, pick ONE and document in README]:**
- **MVP (recommended for this timebox):** Annualize current month's taxable earnings × 12 → apply progressive slabs → annual tax ÷ 12 = monthly TDS. Simple, deterministic, easy to test.
- **More realistic (stretch goal, document as "with more time"):** True YTD cumulative — track YTD taxable income + YTD tax withheld; each month compute tax on (YTD + current month), subtract tax already withheld, remainder is this month's TDS. Handles bonuses/raises correctly but needs YTD state per employee.

Build and test the MVP method first. Only attempt YTD if time remains.

**Worked example (MVP method), SSF employee, Basic 50,000, DA 5,000, Conveyance 3,000, Transport 2,000, Overtime 7,500 for this cycle:**
```
Monthly taxable earnings = 50,000 + 5,000 + 3,000 + 2,000 + 7,500 = 67,500
  (Secret salary and reimbursements excluded — see §2)
Annualized = 67,500 × 12 = 810,000

Tax:
  810,000 × 1% = 8,100  (entire amount falls in first slab, ≤10,00,000)

Annual tax = 8,100
Monthly TDS = 8,100 / 12 = 675
```
**Worked example, higher earner, annualized taxable = 18,00,000:**
```
10,00,000 × 1%  = 10,000
 5,00,000 × 10% =  50,000
 3,00,000 × 20% =  60,000
----------------------------
Annual tax      = 120,000
Monthly TDS     = 10,000
```

### 3.3 In-house Security Fund
Company-internal, non-statutory, configurable %, separate from SSF.
**[ASSUMPTION: base = Basic Pay only, same base as SSF, for consistency]** — flag this explicitly in README since the assignment doesn't specify.
```
Security Fund = securityFundRate% × Basic Pay
```

### 3.4 Advance Recovery
```
Advance {
  originalAmount, outstandingBalance, recoveryPerCycle, status: ACTIVE|CLOSED
}
```
Each payroll run for that employee:
```
recovery = min(recoveryPerCycle, outstandingBalance)
outstandingBalance -= recovery
if outstandingBalance == 0 → status = CLOSED
```
Recovery amount appears as a deduction line item each cycle until closed.

---

## 4. Calculation Order (per employee, per cycle)

```
1. Load employee + salary profile + active advances + active reimbursements
2. Sum fixed earnings (Basic, DA, Conveyance)
3. Sum dynamic allowances
4. Calculate overtime (hours × hourlyRate × multiplier, default 1.5×)
5. Add one-time reimbursement (if pending, then mark consumed)
6. Add recurring reimbursements (if active)
7. Gross earnings (employee-visible) = 2+3+4+5+6
8. Taxable income (annualized) = (2+3+4) × 12   [reimbursements excluded, per §2]
9. TDS = progressive_tax(taxable income) / 12
10. Employee SSF = employmentType == SSF ? 11% × Basic : 0
11. Employer SSF = employmentType == SSF ? 20% × Basic : 0
12. Security Fund = securityFundRate × Basic
13. Advance recovery = min(recoveryPerCycle, outstandingBalance)
14. Total deductions = TDS + Employee SSF + Security Fund + Advance recovery
15. Net Pay = Gross earnings (step 7) − Total deductions (step 14)
16. Secret salary calculated separately, added ONLY to admin cost view:
      Admin Total Cost = Gross earnings + Secret Salary + Employer SSF
17. Persist full snapshot (incl. secret salary) — filter at the DTO/view layer, not by omitting from storage
```

---

## 5. Secret Salary — visibility rule

- Stored on the employee's salary profile.
- Excluded from steps 7–9 (gross, taxable income) entirely.
- Never serialized in any `view=employee` API response or on the payslip template.
- Included only in `view=admin` cost responses.
- Enforce this at the DTO/serializer layer (strip the field), not just in the UI — an employee hitting the admin API route directly must also get it stripped unless role=admin.

---

## 6. SSF vs Non-SSF Reporting

Payroll run endpoint accepts an optional `employmentType` filter (`SSF` | `NON_SSF` | omit for all) and returns/report totals split by group.

---

## 7. Test Cases (drive TDD of the calculator)

| # | Scenario | Key assertions |
|---|---|---|
| 1 | SSF employee, Basic 50,000, DA 5,000, Conveyance 3,000, no extras | Employee SSF = 5,500; Employer SSF = 10,000; TDS per annualized 1% slab |
| 2 | Non-SSF employee, same basic/allowances | SSF = 0 both sides; TDS computed on same taxable base, no SSF exemption applied |
| 3 | Employee with dynamic allowance "Transport 2,000" added via config, no code change | Appears correctly in gross + payslip |
| 4 | Employee with overtime 10 hrs @ 500, default 1.5× | Overtime = 7,500 |
| 5 | Employee with one-time reimbursement 3,000 | Appears this cycle only; gone next cycle; not taxed |
| 6 | Employee with recurring reimbursement 1,000/mo | Appears every cycle until explicitly stopped |
| 7 | Employee with advance 30,000, recovery 10,000/mo | Balance: 20,000 → 10,000 → 0 (status CLOSED) over 3 cycles |
| 8 | Employee with secret salary 10,000 | Not in employee payslip gross/net; not in SSF/TDS base; appears in admin cost view only |
| 9 | High earner, annualized taxable = 18,00,000 | Annual tax = 120,000 (see worked example above) |
| 10 | Payroll run filtered by `employmentType=SSF` | Returns only SSF employees, correct subtotal |

---

## 8. Open Assumptions Log (copy into README)

1. Monthly TDS = annualized-and-divided MVP method (not true YTD cumulative).
2. SSF base = Basic Pay only (not DA/Conveyance/allowances), per the assignment's explicit "31% of basic pay."
3. Reimbursements (one-time and recurring) are non-taxable, non-SSF-contributory — treated as expense repayment, not income.
4. In-house Security Fund base = Basic Pay (same base as SSF), for consistency, since the assignment doesn't specify.
5. Advance recovery amount per cycle is a configured fixed amount per advance (not automatically recalculated); partial final recovery is capped at the remaining balance.
