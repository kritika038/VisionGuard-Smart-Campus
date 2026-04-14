export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">VisionGuard AI</h1>
        <p className="text-xl text-slate-300">
          Smart Attendance Management System
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Login
          </a>

          <a
            href="/about"
            className="px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-800"
          >
            Explore
          </a>
        </div>
      </div>
    </main>
  );
}