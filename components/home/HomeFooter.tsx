import { Button } from "@/components/ui/button";

const footerLinks = ["Privacy Policy", "Terms of Service", "Contact"];

const HomeFooter = () => {
  return (
    <footer className="border-t border-slate-200/20 py-12 dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#3b19e6] text-[11px] font-bold text-white">
            W
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Workspace.</span>
        </div>

        <div className="flex gap-2 text-sm font-medium text-slate-500">
          {footerLinks.map((link) => (
            <Button
              key={link}
              asChild
              className="px-3 text-slate-500 hover:text-[#3b19e6]"
              variant="link"
            >
              <a href="#">{link}</a>
            </Button>
          ))}
        </div>

        <p className="text-sm text-slate-500">(c) 2026 Workspace Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
export default HomeFooter;
