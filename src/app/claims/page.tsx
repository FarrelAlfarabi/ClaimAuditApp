import { listClaims } from "@/lib/db";
import config from "../../../config/rules.config.json";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Always read fresh from SQLite (seed can be re-run while dev server is up).
export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const idr = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function Home() {
  const claims = listClaims();

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
        <b>MOCK DATA.</b> All employees, departments, managers, category limits and working hours are invented
        placeholders (contoh, bukan kebijakan Ruangguru). Manager approval status is mocked.
      </div>

      <div>
        <h1 className="text-2xl font-semibold">All claims (raw)</h1>
        <p className="text-sm text-muted-foreground">
          {claims.length} claims straight from the SQLite DB. No rules engine yet, nothing is flagged.
        </p>
      </div>

      <div className="text-xs text-muted-foreground space-x-3">
        <Badge variant="mock">MOCK limits</Badge>
        {Object.entries(config.categoryLimits).map(([c, l]) => (
          <span key={c}>{c}: {idr(l)}</span>
        ))}
        <span>| Working hours: {config.workingHours.start} to {config.workingHours.end}</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Manager</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((c) => (
            <TableRow key={c.id}>
              <TableCell><a href={`/claims/${c.id}`} className="underline">{c.id}</a></TableCell>
              <TableCell>{c.employee_name}</TableCell>
              <TableCell>{c.department_name}</TableCell>
              <TableCell>{c.category}</TableCell>
              <TableCell>{c.merchant}</TableCell>
              <TableCell className="text-right tabular-nums">{idr(c.amount)}</TableCell>
              <TableCell className="tabular-nums">
                {c.transaction_date} ({DAYS[new Date(`${c.transaction_date}T00:00:00Z`).getUTCDay()]})
              </TableCell>
              <TableCell className="tabular-nums">{c.transaction_time ?? "-"}</TableCell>
              <TableCell>
                {c.receipt_path ? (
                  <a href={c.receipt_path} target="_blank" className="underline">view</a>
                ) : (
                  <span className="text-muted-foreground">none</span>
                )}
              </TableCell>
              <TableCell>
                {c.manager_status} <Badge variant="mock">MOCK</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
