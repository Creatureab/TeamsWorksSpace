export default function TrashPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f6f6f8] text-slate-800">
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Trash</p>
        <p className="mt-1 text-sm text-slate-500">
          Deleted items will live here. This page is a placeholder until the trash backend is wired.
        </p>
      </div>
    </div>
  );
}
