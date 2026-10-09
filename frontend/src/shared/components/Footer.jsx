export default function Footer() {
    return (
        <footer className="border-t border-outline-variant/40 bg-white px-8 py-4 mt-auto">
            <div className="flex items-center justify-between text-sm text-on-variant">
                <p>© 2026 MedLink — Cliniques partenaires Tunisie</p>
                <div className="flex gap-4">
                    <a href="/privacy" className="hover:text-primary transition">Confidentialité</a>
                    <a href="/terms" className="hover:text-primary transition">Conditions</a>
                    <a href="/contact" className="hover:text-primary transition">Contact</a>
                </div>
            </div>
        </footer>
    );
}