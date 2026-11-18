import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-medlink.jpg';
export default function Landing() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    // Déjà connecté : direct dans l'app. Sinon : directement la page Keycloak.
    const goToApp = () => (user ? navigate('/app') : login().catch(console.error));
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-outline-variant bg-white/95 backdrop-blur sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            {/* ✅ Logo intégré */}
                            <img src={logo} alt="MedLink Logo" className="h-10 w-auto object-contain" />
                            <span className="font-display text-xl font-bold text-on-surface">MedLink</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#services" className="text-sm font-medium text-on-variant hover:text-primary transition">Services</a>
                            <a href="#about" className="text-sm font-medium text-on-variant hover:text-primary transition">À propos</a>
                            <a href="#clinics" className="text-sm font-medium text-on-variant hover:text-primary transition">Cliniques</a>
                            <a href="#contact" className="text-sm font-medium text-on-variant hover:text-primary transition">Contact</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={goToApp} className="btn-secondary hidden sm:inline-flex">Se connecter</button>
                            <Link to="/signup" className="btn-primary">Créer un compte</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-gradient py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="fade-in">
                            <span className="badge-info mb-6 inline-flex px-4 py-2">✓ Plateforme sécurisée et conforme INPDP</span>
                            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight text-on-surface mb-6">
                                Votre santé,<br /><span className="text-primary">notre priorité</span>
                            </h1>
                            <p className="text-lg text-on-variant mb-8 leading-relaxed">
                                Accédez à votre espace patient ou praticien sécurisé. Dossiers médicaux, rendez-vous et résultats d'analyses en un seul endroit.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={goToApp} className="btn-primary text-lg px-8 py-4">Réserver un rendez-vous →</button>
                                <a href="#services" className="btn-outline text-lg px-8 py-4">Découvrir nos services</a>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-outline-variant">
                                <div><p className="text-3xl font-bold text-primary">3</p><p className="text-sm text-on-variant">Cliniques partenaires</p></div>
                                <div><p className="text-3xl font-bold text-primary">50+</p><p className="text-sm text-on-variant">Médecins experts</p></div>
                                <div><p className="text-3xl font-bold text-primary">10k+</p><p className="text-sm text-on-variant">Patients satisfaits</p></div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="card bg-white shadow-large p-8">
                                <h3 className="font-display text-2xl font-bold mb-6 text-on-surface">Réserver un rendez-vous</h3>
                                <form className="space-y-4">
                                    <div><label className="label">Nom complet</label><input type="text" placeholder="Votre nom" className="input" /></div>
                                    <div><label className="label">Téléphone</label><input type="tel" placeholder="+216 XX XXX XXX" className="input" /></div>
                                    <div>
                                        <label className="label">Spécialité</label>
                                        <select className="select">
                                            <option value="">Choisir une spécialité</option>
                                            <option>Cardiologie</option><option>Pédiatrie</option><option>Médecine générale</option>
                                        </select>
                                    </div>
                                    <button type="button" className="btn-primary w-full py-4 text-lg">Réserver maintenant →</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-surface-low">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold text-on-surface mb-4">
                            Nos services médicaux
                        </h2>
                        <p className="text-lg text-on-variant max-w-2xl mx-auto">
                            Des soins complets et personnalisés pour toute la famille
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: '❤️', title: 'Cardiologie', desc: 'Soins cardiaques complets par des experts spécialisés', link: '#' },
                            { icon: '👶', title: 'Pédiatrie', desc: 'Suivi médical doux et expert pour vos enfants', link: '#' },
                            { icon: '🦴', title: 'Orthopédie', desc: 'Prise en charge des troubles osseux et articulaires', link: '#' },
                            { icon: '', title: 'Médecine générale', desc: 'Consultations et suivi médical de proximité', link: '#' },
                            { icon: '🧪', title: 'Analyses médicales', desc: 'Laboratoire d\'analyses biologiques moderne', link: '#' },
                            { icon: '💊', title: 'Pharmacie', desc: 'Service pharmaceutique intégré', link: '#' },
                        ].map((service, idx) => (
                            <div key={idx} className="card-hover bg-white">
                                <div className="text-5xl mb-4">{service.icon}</div>
                                <h3 className="font-display text-xl font-bold mb-3 text-on-surface">{service.title}</h3>
                                <p className="text-on-variant text-sm mb-4">{service.desc}</p>
                                <button className="text-primary font-semibold text-sm hover:underline">
                                    En savoir plus →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="about" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-4xl font-bold text-on-surface mb-6">
                                Pourquoi choisir MedLink ?
                            </h2>
                            <p className="text-on-variant mb-8 leading-relaxed">
                                Nous combinons expertise médicale, technologie avancée et compassion
                                pour vous offrir la meilleure expérience de soins possible.
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Médecins expérimentés et bienveillants',
                                    'Équipements modernes et de pointe',
                                    'Plans de traitement personnalisés',
                                    'Environnement confortable et accueillant',
                                    'Prise de rendez-vous en ligne 24/7',
                                    'Résultats d\'analyses disponibles en ligne',
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-container text-success text-sm">
                                            ✓
                                        </div>
                                        <span className="text-on-surface">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="card text-center p-8">
                                <p className="text-4xl font-bold text-primary mb-2">20+</p>
                                <p className="text-sm text-on-variant">Années d'expérience</p>
                            </div>
                            <div className="card text-center p-8">
                                <p className="text-4xl font-bold text-primary mb-2">50+</p>
                                <p className="text-sm text-on-variant">Médecins experts</p>
                            </div>
                            <div className="card text-center p-8">
                                <p className="text-4xl font-bold text-primary mb-2">20k+</p>
                                <p className="text-sm text-on-variant">Patients heureux</p>
                            </div>
                            <div className="card text-center p-8">
                                <p className="text-4xl font-bold text-primary mb-2">98%</p>
                                <p className="text-sm text-on-variant">Satisfaction patient</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Clinics */}
            <section id="clinics" className="py-20 bg-surface-low">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold text-on-surface mb-4">
                            Nos cliniques partenaires
                        </h2>
                        <p className="text-lg text-on-variant">
                            Trois sites modernes à votre service en Tunisie
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Clinique El Amen', city: 'Sousse', address: 'Avenue Habib Bourguiba', phone: '+216 73 111 111' },
                            { name: 'Clinique Taoufik', city: 'Sfax', address: 'Route de Tunis', phone: '+216 74 222 222' },
                            { name: 'Clinique Pasteur', city: 'Tunis', address: 'Avenue Mohamed V', phone: '+216 71 333 333' },
                        ].map((clinic, idx) => (
                            <div key={idx} className="card bg-white">
                                <h3 className="font-display text-xl font-bold mb-2 text-on-surface">{clinic.name}</h3>
                                <p className="text-primary font-semibold mb-4">{clinic.city}</p>
                                <div className="space-y-2 text-sm text-on-variant">
                                    <p>📍 {clinic.address}</p>
                                    <p>📞 {clinic.phone}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold text-on-surface mb-4">
                            Ce que disent nos patients
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Sarah J.', location: 'Sousse', text: 'Le personnel est formidable ! Ils se soucient vraiment de leurs patients et fournissent un service excellent.' },
                            { name: 'Mohamed T.', location: 'Tunis', text: 'Équipe très professionnelle. La prise de rendez-vous en ligne est simple et rapide.' },
                            { name: 'Leila B.', location: 'Sfax', text: 'Je recommande vivement MedLink pour tous ceux qui recherchent des soins de qualité.' },
                        ].map((testimonial, idx) => (
                            <div key={idx} className="card bg-surface-low">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-warning">★</span>
                                    ))}
                                </div>
                                <p className="text-on-surface mb-4 italic">"{testimonial.text}"</p>
                                <div>
                                    <p className="font-semibold text-on-surface">{testimonial.name}</p>
                                    <p className="text-sm text-on-variant">{testimonial.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h2 className="font-display text-4xl font-bold text-white mb-6">
                        Prêt à prendre soin de votre santé ?
                    </h2>
                    <p className="text-white/80 text-lg mb-8">
                        Réservez votre rendez-vous en ligne dès maintenant ou contactez-nous
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button type="button" onClick={goToApp} className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-surface-low transition">
                            Prendre rendez-vous
                        </button>
                        <a href="tel:+21671123456" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition">
                            Nous appeler
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-on-surface text-white py-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {/* ✅ Logo avec fond blanc pour être visible sur fond sombre */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                                    <img src={logo} alt="MedLink Logo" className="h-full w-full object-contain" />
                                </div>
                                <span className="font-display text-xl font-bold text-white">MedLink</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">Nous nous engageons à fournir des soins exceptionnels avec compassion, expertise et technologie avancée.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Liens rapides</h4>
                            <ul className="space-y-2 text-sm text-white/60">
                                <li><a href="#about" className="hover:text-primary transition">À propos</a></li>
                                <li><a href="#services" className="hover:text-primary transition">Nos services</a></li>
                                <li><a href="#clinics" className="hover:text-primary transition">Nos cliniques</a></li>
                                <li><button type="button" onClick={goToApp} className="hover:text-primary transition">Espace patient</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Informations</h4>
                            <ul className="space-y-2 text-sm text-white/60">
                                <li><a href="#" className="hover:text-primary transition">Prendre RDV</a></li>
                                <li><a href="#" className="hover:text-primary transition">Nos spécialités</a></li>
                                <li><a href="#" className="hover:text-primary transition">Assurances acceptées</a></li>
                                <li><a href="#" className="hover:text-primary transition">Portail patient</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm text-white/60">
                                <li>📍 Sousse, Sfax, Tunis</li>
                                <li>📞 +216 73 333 333</li>
                                <li>✉️ contact@medlink.tn</li>
                                <li>🕐 Lun - Sam: 8h00 - 20h00</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-white/60">
                            © 2026 MedLink. Tous droits réservés.
                        </p>
                        <div className="flex gap-6 text-sm text-white/60">
                            <a href="#" className="hover:text-primary transition">Confidentialité</a>
                            <a href="#" className="hover:text-primary transition">Conditions</a>
                            <a href="#" className="hover:text-primary transition">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}