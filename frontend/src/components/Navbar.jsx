export default function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-lg">ClinicBooking</div>
        <nav className="flex gap-4 text-sm">
          <a className="hover:underline" href="/">Home</a>
          <a className="hover:underline" href="/booking">Booking</a>
          <a className="hover:underline" href="/login">Login</a>
        </nav>
      </div>
    </header>
  );
}
