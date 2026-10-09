import { useEffect, useState } from 'react';
import { api } from '../api';

function statusBadge(status) {
  const map = {
    normal: 'badge-success',
    abnormal: 'badge-warning',
    critical: 'badge-error',
  };
  const labels = {
    normal: 'Normal',
    abnormal: 'Anormal',
    critical: 'Critique',
  };
  return <span className={map[status] || 'badge-info'}>{labels[status] || status}</span>;
}

export default function Results() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.records
      .results()
      .then(setList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-error-container p-4 text-error">{error}</div>;
  }

  // Group by date
  const grouped = list.reduce((acc, r) => {
    const d = r.result_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">Mes résultats</h2>
        <p className="mt-1 text-sm text-on-variant">
          Analyses biologiques et bilans de laboratoire
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-on-variant">Aucun résultat d’analyse disponible.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, results]) => (
          <div key={date} className="card overflow-hidden p-0">
            <div className="border-b border-outline-variant/40 bg-surface-low px-5 py-3">
              <h3 className="font-semibold text-primary">
                {new Date(date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-variant">
                  <th className="px-5 py-2.5 font-medium">Examen</th>
                  <th className="px-5 py-2.5 font-medium">Résultat</th>
                  <th className="px-5 py-2.5 font-medium">Référence</th>
                  <th className="px-5 py-2.5 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-primary">{r.test_name}</td>
                    <td className="px-5 py-3">
                      {r.result_value} {r.unit}
                    </td>
                    <td className="px-5 py-3 text-on-variant">{r.reference_range}</td>
                    <td className="px-5 py-3">{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
