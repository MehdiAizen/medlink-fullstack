import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    type: 'consultation',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.appointments.doctors().then(setDoctors).catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.appointments.create({
        ...form,
        doctor_id: parseInt(form.doctor_id, 10),
      });
      setSuccess(true);
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="card mx-auto max-w-lg py-16 text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h3 className="font-display text-xl font-semibold text-primary">
          Rendez-vous demandé !
        </h3>
        <p className="mt-2 text-sm text-on-variant">
          Vous allez être redirigé vers vos rendez-vous…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">
          Prendre un rendez-vous
        </h2>
        <p className="mt-1 text-sm text-on-variant">
          Choisissez un praticien et un créneau
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="doctor_id">
            Médecin
          </label>
          <select
            id="doctor_id"
            name="doctor_id"
            className="input"
            value={form.doctor_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner un praticien</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name} — {d.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="appointment_date">
              Date
            </label>
            <input
              id="appointment_date"
              name="appointment_date"
              type="date"
              className="input"
              min={minDateStr}
              value={form.appointment_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="appointment_time">
              Heure
            </label>
            <select
              id="appointment_time"
              name="appointment_time"
              className="input"
              value={form.appointment_time}
              onChange={handleChange}
              required
            >
              <option value="">Choisir</option>
              {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="type">
            Type de consultation
          </label>
          <select
            id="type"
            name="type"
            className="input"
            value={form.type}
            onChange={handleChange}
          >
            <option value="consultation">Consultation</option>
            <option value="suivi">Suivi</option>
            <option value="urgence">Urgence</option>
            <option value="teleconsultation">Téléconsultation</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="reason">
            Motif (optionnel)
          </label>
          <textarea
            id="reason"
            name="reason"
            className="input min-h-[80px] resize-y"
            value={form.reason}
            onChange={handleChange}
            placeholder="Décrivez brièvement le motif de votre consultation…"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Envoi…' : 'Demander le rendez-vous'}
        </button>
      </form>
    </div>
  );
}
