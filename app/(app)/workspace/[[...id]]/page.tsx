import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";

export default function WorkspacePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
      <Sidebar />
      <Hero />
    </div>
  );
}
