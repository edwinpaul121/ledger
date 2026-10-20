import { Library, Twitter, Instagram, Github } from "lucide-react";

const columns = [
  { heading: "Product", links: ["Discover", "Features", "Import Tool", "Pro Plans"] },
  { heading: "Community", links: ["Reviews Feed", "Top Curators", "Lists Showcase", "API"] },
  { heading: "Company", links: ["About Us", "Journal", "Privacy Policy", "Support"] },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink-line bg-ink px-20 pb-10 pt-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="flex max-w-sm flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-mint">
                <Library className="size-5 text-ink" strokeWidth={2.25} />
              </span>
              <span className="font-display text-[22px] text-paper">Ledger</span>
            </div>
            <p className="text-sm leading-relaxed text-paper-dim">
              The home for your pop culture logs. Rate movies, archive finished
              games, and list TV gems in one clean journal.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            {columns.map((col) => (
              <div key={col.heading} className="flex w-[120px] flex-col gap-4 text-[13px]">
                <p className="font-bold uppercase text-paper">{col.heading}</p>
                {col.links.map((link) => (
                  <p key={link} className="text-paper-dim">
                    {link}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink-line pt-6 text-[13px] text-paper-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Ledger. All rights reserved.</p>
          <div className="flex gap-4">
            <Twitter className="size-[18px]" />
            <Instagram className="size-[18px]" />
            <Github className="size-[18px]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
