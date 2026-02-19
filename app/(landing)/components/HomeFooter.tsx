import { Button } from "@/components/ui/button";

const footerLinks = ["Privacy Policy", "Terms of Service", "Contact"];

const HomeFooter = () => {
  return (
    <footer className="border-t border-gray-100 py-16 dark:border-white/5 bg-white dark:bg-[#0b0f17]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b19e6] text-[13px] font-bold text-white shadow-lg shadow-[#3b19e6]/20">
            W
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Workspace.</span>
        </div>

        <div className="flex gap-4 text-sm font-medium">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-gray-500 hover:text-[#3b19e6] dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500">
          &copy; 2026 Softwelve. Built for creators.
        </p>
      </div>
    </footer>
  );
}
export default HomeFooter;
