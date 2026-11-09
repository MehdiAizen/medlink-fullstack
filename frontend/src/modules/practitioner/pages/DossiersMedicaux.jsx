export default function DossiersMedicaux() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dossiers médicaux (US-23 & US-47)</h1>
        <p className="text-gray-500">Accès au dossier du patient avec journalisation obligatoire.</p>
      </header>
      <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-amber-800 font-medium">⚠️ Veuillez d'abord sélectionner un patient depuis la liste "Mes patients".</p>
      </div>
    </div>
  );
}