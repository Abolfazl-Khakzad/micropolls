export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t text-center py-6 text-gray-500 text-sm">
      <p>
        © {new Date().getFullYear()} <span className="text-brand font-semibold">Micropolls</span>.  
        Built with ❤️ in Italy.
      </p>
      <div className="flex justify-center mt-3 space-x-4">
        <a href="#" className="hover:text-brand">Twitter</a>
        <a href="#" className="hover:text-brand">Telegram</a>
        <a href="#" className="hover:text-brand">Contact</a>
      </div>
    </footer>
  );
}
