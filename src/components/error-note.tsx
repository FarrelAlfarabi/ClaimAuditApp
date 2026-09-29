import { IconAlertCircle } from "@/components/icons";

export function ErrorNote({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="banner banner-error">
      <IconAlertCircle className="mt-0.5 shrink-0" />
      <span>{msg}</span>
    </p>
  );
}
