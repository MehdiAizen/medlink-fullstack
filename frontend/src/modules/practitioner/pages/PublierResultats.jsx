export default function PublierResultats() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Publier des résultats (US-25)</h1>
        <p className="text-gray-500">Ajout de résultats d'examens au dossier du patient.</p>
      </header>
      <div className="p-8 bg-white border-2 border-dashed border-gray-300 rounded-xl text-center">
        <p className="text-gray-500 mb-4">Glissez-déposez un fichier ici, ou cliquez pour parcourir</p>
        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
      </div>
    </div>
  );
}