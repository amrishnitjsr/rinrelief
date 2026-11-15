export default function AdminLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-navy shadow-soft">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        Loading admin workspace...
      </div>
    </div>
  );
}
