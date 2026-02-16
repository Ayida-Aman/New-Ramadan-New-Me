export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted text-sm">
          <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="currentColor" />
          </svg>
          New Ramadan New Me
        </div>
        <p className="text-sm text-muted">
          Built with love for the Ummah by <a href="https://t.me/aydus_journal" className="text-gold hover:underline">Ninja girl</a>.
        </p>
      </div>
    </footer>
  );
}
