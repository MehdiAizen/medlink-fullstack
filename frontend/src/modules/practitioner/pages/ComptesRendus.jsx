export default function ComptesRendus() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Comptes-rendus (US-24 & US-26)</h1>
        <p className="text-gray-500">Rédaction et historique des comptes-rendus de consultation.</p>
      </header>
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Nouveau compte-rendu</h3>
        <textarea 
          placeholder="Saisir le compte-rendu de la consultation..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          rows="4"
        />
        <button className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          Enregistrer le compte-rendu
        </button>
      </div>
    </div>
  );
}