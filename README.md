![alt text](image-1.png)
![alt text](image-2.png)
# Mini Payroll System (Nepal)

A small end-to-end payroll system that follows how Nepali payroll actually works: SSF, progressive income tax (TDS), an in-house security fund, advances, reimbursements, dynamic allowances, and an admin-only "secret" pay component. It runs fully locally with no cloud services or paid APIs.

- **Currency:** NPR
- **Fiscal year baseline:** FY 2083/84 (rates live in the database, not in code)
- **All employee data is dummy data**

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [How it maps to the requirements](#4-how-it-maps-to-the-requirements)
5. [Data model](#5-data-model)
6. [How payroll is calculated](#6-how-payroll-is-calculated)
7. [API reference](#7-api-reference)
8. [Payslips](#8-payslips)
9. [Edge cases handled](#9-edge-cases-handled)
10. [Assumptions](#10-assumptions)
11. [Known limitations](#11-known-limitations)
12. [What I would do with more time](#12-what-i-would-do-with-more-time)
13. [Sample payslips](#13-sample-payslips)

---

## 1. Quick start

**Prerequisites**

- Node.js 20 or newer
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or any URI you put in `.env`)

**Setup**

```bash
git clone <your-repo-url>
cd payroll/server
npm install
cp .env.example .env        # then edit MONGO_URI / PORT if needed
npm run seed                # seeds the FY 2083/84 PayrollConfig
npm run dev                 # starts the API
```

`.env` values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/payroll
```

`npm run seed` is idempotent. Running it again skips a fiscal year that already exists.

> The seed script lives at `src/modules/payrollConfig/seedPayrollConfig.ts`. Point the `seed` script in `package.json` at it, for example `"seed": "tsx src/modules/payrollConfig/seedPayrollConfig.ts"`.

**Try it in five steps** (Thunder Client, Postman or curl; base URL `http://localhost:5000/api/v1`)

1. `POST /employees` to create an employee.
2. `POST /allowances` to create the allowance catalog (payloads in [section 13](#13-sample-payslips)).
3. `POST /salaries` to assign basic pay and allowances to the employee.
4. `POST /payroll/run` to run payroll for one employee, or `POST /payroll/run-batch` for everyone.
5. Open `GET /payroll/:id/payslip` in a **browser** to see the payslip. Add `?view=admin` for the admin view.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js, TypeScript |
| API | Express, with `express-async-errors` |
| Database | MongoDB via Mongoose |
| Validation | Zod |
| Payslip | Server-rendered, print-friendly HTML (no external fonts or assets) |

MongoDB was chosen because allowances are dynamic. An allowance is just a document, so adding one never needs a schema change.

---

## 3. Project structure

One folder per concern. Every module follows the same `model → schema → service → controller → routes` shape.

```
src/modules/
  employee/        Employee CRUD
  allowance/       Allowance catalog (dynamic line-item definitions)
  salary/          Effective-dated basic pay + per-employee allowance amounts
  payrollConfig/   Versioned rates: SSF %, security fund %, OT multiplier, tax slabs
  advance/         Salary advances with running balance + deduction history
  reimbursement/   One-time and recurring reimbursements
  payroll/
    payroll.engine.ts        Pure calculation functions (no DB access)
    payroll.types.ts         Engine input/output types
    payrollRun.model.ts      One document per employee per period (the payslip record)
    payrollRun.service.ts    Orchestrator: gathers inputs, calls engine, persists, updates state
    payrollRun.controller.ts
    payrollRun.routes.ts
    payslip.template.ts      HTML payslip renderer (employee and admin views)
```

The most important design decision: **`payroll.engine.ts` is pure.** It takes plain objects and returns plain objects, with no database calls. That makes the money math independently testable and is the single source of truth for every figure on a payslip.

---

## 4. How it maps to the requirements

| Requirement | Where / how |
|---|---|
| Employee CRUD, SSF vs non-SSF, bank details | `employee` module. `ssfStatus` is `SSF` or `NON_SSF`. |
| Fixed line items (DA, Conveyance) | Seeded as ordinary `Allowance` documents, so there is one earnings code path. |
| Dynamic allowances without code changes | `Allowance` catalog + `Salary.allowances[]` (`{ allowance, amount }`). Adding one is a new document. |
| Overtime (hours × rate × multiplier) | Engine. Multiplier comes from `PayrollConfig` (default 1.5). |
| One-time reimbursement | `Reimbursement` with `type: ONE_TIME`. `PENDING` becomes `APPLIED` once consumed. |
| Recurring reimbursement | `Reimbursement` with `type: RECURRING`. `ACTIVE` until stopped. |
| Advance with outstanding balance | `Advance.outstandingBalance` plus an embedded `deductions[]` audit trail. |
| SSF 11% employee / 20% employer | Engine. Employee share is deducted; employer share is recorded as employer cost only. |
| Progressive TDS from a versioned table | `PayrollConfig.taxSlabs`, resolved by date. Nothing hardcoded. |
| In-house Security Fund (configurable %) | `PayrollConfig.securityFundRate`, kept separate from SSF. |
| Secret / admin-only component | `Allowance.isSecret`. Excluded from TDS, hidden from the employee payslip, shown in the admin view and cost totals. |
| SSF vs non-SSF separation and filtering | Engine branches on `ssfStatus`. Filter runs via `GET /payroll/ssf/:status` and the batch `ssfStatus` option. |
| Payslip per employee per period | HTML payslip with employee and admin views. |
| Role flag instead of real auth | `?view=admin` query parameter on the payslip endpoint. |

---

## 5. Data model

| Collection | Purpose | Notable fields |
|---|---|---|
| `Employee` | Person record | `employeeCode`, `ssfStatus`, `joiningDate`, `bank`, `status` |
| `Allowance` | Catalog of allowance types | `code` (unique), `calculationType`, `defaultAmount`, `taxable`, `isSecret`, `isActive` |
| `Salary` | Effective-dated pay structure | `employeeId`, `basicSalary`, `allowances[{allowance, amount}]`, `effectiveDate` |
| `PayrollConfig` | Rates per fiscal year | `fiscalYear` (unique), `ssfEmployeeRate`, `ssfEmployerRate`, `securityFundRate`, `overtimeMultiplier`, `taxSlabs[]`, `effectiveFrom` |
| `Advance` | Advance + balance | `amount`, `outstandingBalance`, `status`, `deductions[]` |
| `Reimbursement` | Reimbursement lifecycle | `type`, `status`, `taxable`, `appliedInPayrollRunId` |
| `PayrollRun` | The payslip record | Snapshot of every input, every calculated figure, and the config used |

Design notes:

- **`Allowance` versus `Salary.allowances[]`.** `Allowance` is the definition (catalog). The subdocument on `Salary` is the per-employee amount. The engine only ever reads the per-employee `amount`. `defaultAmount` is a form pre-fill hint and is never used as a fallback, because an explicit `0` is a legitimate value.
- **Versioning by date, not by flag.** `Salary` and `PayrollConfig` are both resolved as "the newest record with `effective date <= period date`". A new fiscal year or a raise is a new document. Old ones are never edited, so historical payslips stay reproducible.
- **`PayrollRun` is a full snapshot.** It stores allowance lines, reimbursement lines, advance deductions and the config rates used. Changing an allowance or a fiscal year later cannot alter an old payslip.
- **Uniqueness.** `{ employeeId, periodStart }` is unique on `PayrollRun`, so an employee cannot be paid twice for one period.

---

## 6. How payroll is calculated

All of this lives in `payroll.engine.ts` (`calculatePayroll`).

### Formula

```
proration       = payableDays / totalDaysInPeriod            (1 for a full month)

Earnings
  basic         = basicSalary × proration
  allowances    = Σ (allowance amount × proration)           visible + secret
  overtime      = hours × (fullBasic / standardMonthlyHours) × overtimeMultiplier
  reimbursement = Σ one-time + Σ recurring

Gross (employee view) = basic + visible allowances + overtime + reimbursements
Gross (admin view)    = Gross (employee view) + secret allowances

Deductions
  SSF employee  = basic × 11%                                SSF employees only
  Security fund = basic × securityFundRate
  Advance       = amount recovered this cycle
  TDS           = see below

Employer cost = Gross (admin view) + SSF employer (basic × 20%)
Net pay       = Gross (employee view) − all deductions
```

### TDS

Slabs are annual and payroll is monthly, so the engine:

1. Builds the **full-month** taxable income: basic + taxable visible allowances + overtime + taxable reimbursements − SSF employee contribution. Secret allowances and non-taxable lines are excluded.
2. Annualizes it (× 12).
3. Applies the slabs progressively. Only the portion inside each slab is taxed at that slab's rate, never a flat rate on the whole amount.
4. Divides by 12, then multiplies by the proration factor.

FY 2083/84 slabs (seeded as cumulative ceilings so the engine can walk them):

| Annual taxable income (NPR) | Rate | Stored as `upTo` |
|---|---|---|
| First 10,00,000 | 1% | 1,000,000 |
| Next 5,00,000 | 10% | 1,500,000 |
| Next 10,00,000 | 20% | 2,500,000 |
| Next 15,00,000 | 27% | 4,000,000 |
| Above 40,00,000 | 29% | `null` |

Example: NPR 15,00,000 annual income is `10,00,000 × 1% + 5,00,000 × 10% = 60,000`, an effective rate of 4%.

### Worked example (SSF employee, full month)

Basic 50,000. Allowances: DA 5,000, Conveyance 3,000, Transport 2,000 (all taxable). Confidential Retention Bonus 15,000 (secret, non-taxable). 10 overtime hours, `standardMonthlyHours = 200`, multiplier 1.5.

| Line | Calculation | Amount |
|---|---|---|
| Overtime | 10 × (50,000 ÷ 200) × 1.5 | 3,750.00 |
| Gross (employee view) | 50,000 + 10,000 + 3,750 | 63,750.00 |
| Gross (admin view) | 63,750 + 15,000 | 78,750.00 |
| SSF employee | 50,000 × 11% | 5,500.00 |
| SSF employer | 50,000 × 20% | 10,000.00 |
| Security fund | 50,000 × 1% | 500.00 |
| Monthly taxable income | 50,000 + 10,000 + 3,750 − 5,500 | 58,250.00 |
| Annualized | 58,250 × 12 | 699,000.00 |
| Annual tax | 699,000 × 1% | 6,990.00 |
| Monthly TDS | 6,990 ÷ 12 | 582.50 |
| Total deductions | 5,500 + 582.50 + 500 | 6,582.50 |
| **Net pay** | 63,750 − 6,582.50 | **57,167.50** |
| Employer cost | 78,750 + 10,000 | 88,750.00 |

The secret Retention Bonus appears only in the admin gross and the employer cost. It never touches the employee's gross, tax base, deductions or net pay.

### Partial first month (proration)

An employee who joins on 15 September is paid for 16 of 30 days (calendar days, inclusive of the joining date). The next month they are paid in full.

- Basic, allowances, SSF and security fund are prorated.
- The overtime hourly rate uses the **full** basic, since an overtime hour is not worth less because the month was short.
- TDS is calculated on the full-month equivalent and then prorated. Annualizing the half-month income directly would push the employee into a lower slab and under-tax them.

Expected values for basic 50,000, taxable allowances 10,000, no overtime, joining 15 Sep (hand-calculated; expect differences of a paisa or two from rounding):

| Field | Expected |
|---|---|
| Basic paid | 26,666.67 |
| SSF employee | 2,933.33 |
| Security fund | 266.67 |
| Monthly TDS | 290.67 |
| Net pay | 28,509.34 |

---

## 7. API reference

Base URL: `http://localhost:5000/api/v1`. All responses use `{ success, data }`. Errors go through the central error middleware as `AppError(message, status)`.

> Route prefixes below reflect how the modules are mounted in `app.ts`. Adjust if yours differ.

### Employees, allowances, salaries

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/employees` | List / create |
| GET / PATCH / DELETE | `/employees/:id` | Read / update / delete |
| GET / POST | `/allowances` | List / create |
| GET / PATCH / DELETE | `/allowances/:id` | Read / update / delete |
| GET / POST | `/salaries` | List / create |
| GET | `/salaries/employee/:employeeId/current?asOf=` | Salary effective on a date (what payroll uses) |
| GET | `/salaries/employee/:employeeId` | Full version history |
| GET / PATCH / DELETE | `/salaries/:id` | Read / update / delete |

### Payroll config

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/payroll-config` | List / create a new fiscal year |
| GET | `/payroll-config/current?asOf=` | Config effective on a date |
| GET | `/payroll-config/fiscal-year/:fy` | Config for one fiscal year |
| PATCH / DELETE | `/payroll-config/:id` | Update / delete |

### Advances

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/advances` | List / create (starts `ACTIVE` with full balance) |
| GET | `/advances/employee/:employeeId` | History |
| GET | `/advances/employee/:employeeId/active` | Only what payroll can still recover |
| POST | `/advances/:id/deduct` | Manually apply a deduction (payroll does this automatically) |

### Reimbursements

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/reimbursements` | List / create |
| GET | `/reimbursements/employee/:employeeId/payable` | `PENDING` + `ACTIVE` items payroll will include |
| POST | `/reimbursements/:id/apply` | Mark a one-time item consumed |
| POST | `/reimbursements/:id/stop` | Stop a recurring item |

### Payroll runs

| Method | Path | Purpose |
|---|---|---|
| POST | `/payroll/run` | Run payroll for one employee |
| POST | `/payroll/run-batch` | Run payroll for all active employees (optionally one SSF group) |
| GET | `/payroll` | List runs |
| GET | `/payroll/:id` | One run (all figures, full data) |
| GET | `/payroll/employee/:employeeId` | Payslip history for one employee |
| GET | `/payroll/ssf/:status?periodStart=` | Filter runs by `SSF` or `NON_SSF` |
| GET | `/payroll/:id/payslip` | **Employee payslip (HTML)** |
| GET | `/payroll/:id/payslip?view=admin` | **Admin payslip with confidential and employer-cost data (HTML)** |

**Run one employee**

```json
POST /payroll/run
{
  "employeeId": "6ab8aeaec2f94527ea3c3148",
  "periodStart": "2026-09-01",
  "periodEnd": "2026-09-30",
  "hoursWorked": 10,
  "requestedAdvanceRecovery": 5000
}
```

`hoursWorked` defaults to 0. `requestedAdvanceRecovery` is optional; see the advance rules in [section 10](#10-assumptions).

**Run everyone**

```json
POST /payroll/run-batch
{
  "periodStart": "2026-10-01",
  "periodEnd": "2026-10-31",
  "ssfStatus": "SSF",
  "hoursByEmployee": { "6ab8aeaec2f94527ea3c3148": 10 }
}
```

Omit `ssfStatus` to run both groups. The response separates results into `succeeded`, `skipped` (already processed, or joined after the period) and `failed` (real problems to fix, such as a missing salary record). One employee's failure never aborts the rest, and re-running the same batch is safe.

---

## 8. Payslips

Payslips are server-rendered HTML with print styles (`Ctrl+P` → Save as PDF gives a clean A4 document). Open the URL in a browser; an API client will only show raw HTML.

- **Employee view:** company header, employee details, itemised earnings and deductions, a summary strip (gross / deductions / net), a plain-language TDS explanation, and net pay. SSF is shown only for SSF employees. Secret components do not exist anywhere in this HTML, including the source.
- **Admin view (`?view=admin`):** everything above plus confidential components (badged), the employer SSF share, and total cost to company.

The view is chosen by a query flag, as the assignment allows. It is not authentication.

---

## 9. Edge cases handled

| Case | Behaviour |
|---|---|
| SSF vs non-SSF | Non-SSF employees get no SSF line and no SSF-linked tax exemption |
| Secret component | Excluded from TDS and SSF, hidden from the employee payslip, present in admin gross and employer cost |
| One-time reimbursement | Included once, then marked `APPLIED` and never included again |
| Recurring reimbursement | Included every cycle until stopped |
| Applied or stopped reimbursement | Cannot be edited or deleted (protects payroll history) |
| Multiple active advances | Recovered oldest first |
| Advance recovery exceeds balance | Rejected with 400 if explicitly requested |
| Advance recovery would make net pay negative | When not explicitly requested, recovery is capped at what net pay can absorb |
| Advance fully recovered | Balance reaches 0 and status becomes `SETTLED`; excluded from later runs |
| Duplicate payroll run | Blocked with 409, both by a pre-check and by a unique index (covers concurrent requests) |
| Missing salary or missing config | 400 with a message saying what to create |
| New fiscal year | Insert a new `PayrollConfig`; no code change; old payslips are unaffected |
| Employee joins mid-period | Prorated by calendar days |
| Joins after the period ends | Rejected (single run) or skipped (batch) |
| Bad dates / negative hours | 400 at validation |
| Configuration changed after a run | Old payslip unchanged, thanks to the full snapshot |

---

## 10. Assumptions

The spec is ambiguous in places. These are the decisions made, all easy to change.

1. **SSF base is basic salary only.** Allowances, overtime and reimbursements are excluded. This follows the Nepali Labour Rules approach where SSF applies to basic remuneration.
2. **Security fund base is basic salary**, mirroring SSF. The seeded rate is a **1% placeholder**, since the assignment leaves it configurable. Change it in `PayrollConfig`.
3. **Annual slabs are applied by annualizing.** Monthly taxable income × 12, taxed, divided by 12.
4. **The SSF employee contribution is deductible** before tax is computed.
5. **Overtime is taxable.** Reimbursements follow their own `taxable` flag.
6. **`standardMonthlyHours = 200`.** A named constant in `payrollRun.service.ts`. There is no legal universal value, so change it to match company policy.
7. **Fiscal year start.** FY 2083/84 is seeded with `effectiveFrom = 2026-07-17` (1 Shrawan 2083). Verify against the official calendar before relying on exact boundary dates.
8. **Slabs are stored as cumulative ceilings.** The spec's "next 5,00,000 at 10%" is translated to `upTo: 1,500,000`.
9. **Percentage allowances.** `calculationType` and `defaultAmount` are used to pre-fill the amount when assigning an allowance. The payroll engine only reads the explicit `amount` stored on the salary record, so it never re-derives a percentage at run time.
10. **DA and Conveyance are seeded as normal allowances**, so there is a single earnings code path. Both are taxable by default.
11. **Advance recovery policy.** If `requestedAdvanceRecovery` is omitted, the system recovers as much as net pay can absorb (up to the full balance). Pass an explicit amount for fixed installments, or `0` to skip recovery.
12. **Proration uses calendar days** inclusive of the joining date. Some companies use a fixed 30-day month or working days instead; the change is confined to one helper.
13. **A payroll period is one month.** The tax logic annualizes by 12, so multi-month periods are not supported.
14. **Role handling** is a `?view=admin` flag, as permitted by the assignment.
15. **Rounding** happens to 2 decimals at each line, so totals are sums of displayed values.

---

## 11. Known limitations

- **Writes are not atomic.** A payroll run creates a `PayrollRun` and then updates advances and reimbursements. A standalone local MongoDB has no multi-document transactions (they need a replica set). The `PayrollRun` is saved first; if a follow-up update fails it is logged, not swallowed, and may need manual reconciliation.
- **No attendance or leave.** Unpaid leave cannot reduce pay.
- **No mid-period salary changes.** A raise effective mid-month applies to the whole period based on the salary effective at period end.
- **No exit date.** A mid-month resignation cannot be prorated yet.
- **Overtime hours are not persisted.** They are supplied per run (`hoursWorked` or `hoursByEmployee`).
- **No real authentication.** The admin/employee split is a demonstration flag only.
- **HTML payslips only.** There is no server-side PDF generation.

---

## 12. What I would do with more time

1. **Automated tests** for the engine: slab boundaries, SSF/non-SSF, proration, negative net pay, secret exclusion. The pure-function design makes this cheap.
2. **Transactions** via a replica set, so a payroll run and its advance/reimbursement updates commit or roll back together.
3. **`OvertimeEntry` model** with a `PENDING → APPLIED` lifecycle, consistent with reimbursements.
4. **Attendance and unpaid leave**, exit dates, and mid-period salary changes split across the period.
5. **Real authentication and roles**, so the admin view is enforced server-side.
6. **PDF generation** with a headless browser, plus emailing payslips.
7. **Bikram Sambat calendar support** for periods and fiscal-year boundaries.
8. **A config admin UI** with validation (slabs ascending, one open-ended top slab).
9. **Tax refinements** such as rebates and deductions beyond SSF (for example CIT and insurance) if the company uses them.
10. **A dry-run mode** for payroll that returns results without persisting or consuming advances and reimbursements.

---

## 13. Sample payslips

Generate these from the running system and save the browser's *Print → Save as PDF* output into `/samples`:

| File | Employee | View |
|---|---|---|
| `payslip-ssf-employee.pdf` | SSF-registered, with the secret component | Employee |
| `payslip-ssf-admin.pdf` | Same run | Admin (`?view=admin`) |
| `payslip-non-ssf.pdf` | Non-SSF employee | Employee |

**Allowance seed payloads** (`POST /allowances`)

```json
{ "name": "Dearness Allowance", "code": "DA", "calculationType": "FIXED", "defaultAmount": 5000, "taxable": true, "isSecret": false, "isActive": true }
{ "name": "Conveyance Allowance", "code": "CONV", "calculationType": "FIXED", "defaultAmount": 3000, "taxable": true, "isSecret": false, "isActive": true }
{ "name": "Transport Allowance", "code": "TRANS", "calculationType": "FIXED", "defaultAmount": 2000, "taxable": true, "isSecret": false, "isActive": true }
{ "name": "Retention Bonus", "code": "RET-BONUS", "calculationType": "FIXED", "defaultAmount": 15000, "taxable": false, "isSecret": true, "isActive": true }
```

**Salary payload** (`POST /salaries`), using the `_id` values returned above:

```json
{
  "employeeId": "<employee _id>",
  "basicSalary": 50000,
  "allowances": [
    { "allowance": "<DA _id>", "amount": 5000 },
    { "allowance": "<CONV _id>", "amount": 3000 },
    { "allowance": "<TRANS _id>", "amount": 2000 },
    { "allowance": "<RET-BONUS _id>", "amount": 15000 }
  ],
  "effectiveDate": "2026-09-01T00:00:00.000Z"
}
```

Create one employee with `ssfStatus: "SSF"` and one with `ssfStatus: "NON_SSF"`. Run payroll for both (or use `run-batch`), then open each payslip URL.

**Suggested demo scenarios**

- The SSF employee with the secret bonus in both views (employee vs `?view=admin`).
- The non-SSF employee: no SSF line, and a different TDS figure.
- An employee with an active advance, showing the balance decreasing across two runs.
- A one-time reimbursement appearing in one run only.
- An employee joining mid-month, then paid in full the next month.
- A second `POST /payroll/run` for the same period, returning 409.