# VUMA Salon Private Beta

VUMA Salon is a local-first private beta web app for salons and barbers. It is built with Next.js 15, TypeScript, Tailwind CSS, Supabase-ready SQL, and a lightweight Shadcn-style component foundation.

## What is included

- Demo login with no required backend setup
- Local persistence using browser `localStorage`
- CRUD forms for Customers, Staff, Services, Appointments, Sales, and Salon Setup
- Persistent search and filters for customers, staff, appointments, and sales
- Full salon JSON backup export and restore import
- Appointment statuses: `booked`, `confirmed`, `completed`, `cancelled`, `no_show`
- Payment tracking with `unpaid`, `partial`, `paid` plus `cash`, `card`, `EFT`
- Staff commission snapshots per sale
- Customer visit history derived from completed appointments and sales
- CSV export for customers, appointments, and sales
- Supabase-ready schema and seed SQL for a later hosted rollout

## Project structure

```text
vuma-salon/
|-- app/
|   |-- (app)/
|   |   |-- appointments/
|   |   |-- customers/
|   |   |-- dashboard/
|   |   |-- reports/
|   |   |-- sales/
|   |   |-- services/
|   |   |-- setup/
|   |   |-- staff/
|   |   `-- layout.tsx
|   |-- login/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- private-beta/
|   |-- providers/
|   `-- ui/
|-- lib/
|   |-- backup.ts
|   |-- csv.ts
|   |-- download.ts
|   |-- filters.ts
|   |-- formatters.ts
|   |-- local-storage-adapter.ts
|   |-- mock-data.ts
|   |-- salon-analytics.ts
|   |-- session.ts
|   |-- supabase/
|   |-- types.ts
|   |-- validation.ts
|   `-- utils.ts
|-- supabase/
|   |-- schema.sql
|   `-- seed.sql
`-- README.md
```

## How it works

- The app uses a local storage adapter as the active persistence layer.
- A store provider wraps the app pages and saves all CRUD changes back to the browser.
- The data model is intentionally structured so a future Supabase adapter can replace the local adapter without changing page behavior.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

4. Sign in on the demo login screen.

## Optional Supabase preparation

Supabase is not required for the private beta, but the app keeps a Supabase-ready structure:

1. Copy the env file:

```powershell
Copy-Item .env.example .env.local
```

2. Add your Supabase URL and anon key to `.env.local`.

3. When you are ready to prepare hosted persistence, run the SQL in:

- [schema.sql](C:/Users/Ndumiso/OneDrive/Documentos/Playground/vuma-salon/supabase/schema.sql)
- [seed.sql](C:/Users/Ndumiso/OneDrive/Documentos/Playground/vuma-salon/supabase/seed.sql)

## Local-first beta behavior

- The app saves records into browser storage under a versioned key.
- Filters are also saved locally, so search state is preserved when navigating between screens.
- If the storage schema version changes, the local adapter falls back to seeded starter data.
- Deletions are intentionally blocked when linked records still exist, which helps prevent accidental data corruption during beta use.

## Search and filters

- Customers: instant search by customer name or phone number
- Staff: instant search by staff name or phone number
- Appointments: instant search plus filters for status, appointment date, and staff member
- Sales: instant search plus filters for payment status, payment method, and date range
- Filter state is preserved during navigation because it is stored in browser `localStorage`
- Filtered lists show dedicated empty states so testers can tell the difference between "no data yet" and "no match for current filters"

## JSON backup and restore

- Full backup export includes salon settings, customers, staff, services, appointments, and sales
- Backup files include an automatic export timestamp and a schema version
- Backup export is gated by a confirmation modal before the file is downloaded
- Restore/import is gated by a confirmation modal with an overwrite warning
- Restore replaces the current local dataset, so testers should export a fresh backup before importing another file
- JSON backup is designed for local beta safety only and does not sync between devices

## Validation and safety rules

- Required fields are enforced across setup, customers, staff, services, appointments, and sales forms
- Phone numbers are validated before save
- Negative money values, commission values, and invalid totals are blocked
- Appointment times must be valid and the end time must stay after the start time
- Duplicate service names are blocked to keep pricing and reporting clean
- Records linked to appointments or sales cannot be deleted until those linked records are resolved
- Inline field-level errors are shown directly in forms
- Success and error toasts confirm save, delete, export, and restore actions
- Empty states and loading states are included to make beta workflows clearer on desktop and mobile

## CSV exports

- Customers: includes contact details, loyalty points, visit totals, spend, and last visit
- Appointments: includes customer, staff, time, status, services, total, and notes
- Sales: includes payment status, payment method, amount paid, total, and commission

## Private Beta Testing Plan

### Goal

Validate that 2-5 real salons or barbers can run daily admin on VUMA for at least 1 week using local-first persistence without major data loss or workflow blockers.

### Suggested cohort

- 2 salons with mixed styling services
- 1 barbershop with quick-turn appointments
- 1 hybrid grooming studio
- 1 backup participant who can join if another tester drops out

### Core flows to test every day

- Create and edit salon setup
- Add new customers and review visit history
- Add and update staff with commission rates
- Add and retire services
- Create bookings and move them through status changes
- Record sales with partial and full payments
- Check reports for payment collection and staff contribution
- Use search and filters during live admin work
- Export a JSON backup at least once per day
- Restore a JSON backup on a non-primary browser profile to confirm recovery works
- Export CSV at end of day

### Beta tester instructions

1. Open the app in one primary browser profile and keep using that same profile during testing.
2. Complete the salon setup screen first so reports and exports carry the correct business details.
3. Add a small starter set of staff, services, and customers before using appointments and sales in daily work.
4. Use search and filters during normal operations to confirm list screens stay fast and easy to use on phone and desktop.
5. Export a JSON backup before major data cleanup, bulk edits, or end-of-week review.
6. If you test restore, do it after exporting a fresh backup because restore overwrites the current local dataset.
7. Do not clear browser storage or switch browsers mid-test unless you intentionally want to simulate data loss and recovery.
8. Report any case where data disappears, validation blocks a valid workflow, or filters show the wrong records.

### Acceptance criteria

- No data disappears during normal page refreshes
- A non-technical owner can add and edit all core records without help
- Appointment status updates are understandable and fast
- Payment tracking correctly reflects unpaid, partial, and paid states
- Staff commission values match the saved sale totals
- Search and filters return the expected records immediately
- JSON backup exports and restore imports work without corrupting the dataset
- CSV exports open cleanly in spreadsheet software

### Risks to watch closely

- Users clearing browser storage accidentally
- Multiple staff using the same browser profile and overwriting each other
- Restoring an outdated backup over newer live data
- Shared devices causing testers to confuse which salon dataset is currently loaded

### Recommended next build after beta feedback

- Role-based access for reception vs owner
- Supabase persistence adapter
- Audit log for edits and deletes
