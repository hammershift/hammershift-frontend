import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Presentational shell for a single settings card on /profile/settings.
 * Stateless server component — interactivity lives in the children passed
 * in by the parent client component.
 */
export default function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#13202D] p-5 md:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        ) : null}
      </header>
      <div className="border-t border-white/[0.06] pt-4">{children}</div>
    </section>
  );
}
