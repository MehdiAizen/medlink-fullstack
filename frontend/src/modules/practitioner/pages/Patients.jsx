export default function Patients() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Mes patients (US-22)</h1>
        <p className="text-gray-500">Recherche parmi mes propres patients uniquement.</p>
      </header>
      <div className="max-w-md">
        <input 
          type="text" 
          placeholder="Rechercher par nom ou n° de dossier..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
    </div>
  );
}