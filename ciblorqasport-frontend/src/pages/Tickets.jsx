import { useAuth } from "../context/AuthContext";

export default function Tickets() {
  const { user } = useAuth();

  const mockTickets = [
    { id: 1, event: "Plongeon - Finale", date: "14/08/2026", seat: "A12", qr: "QR1234" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Mes billets</h2>
      {user?.role !== "spectateur" ? (
        <p>Seuls les spectateurs ont accès à cette section.</p>
      ) : (
        <ul className="space-y-3">
          {mockTickets.map((t) => (
            <li key={t.id} className="p-3 border rounded">
              <div className="font-medium">{t.event}</div>
              <div>Date : {t.date}</div>
              <div>Place : {t.seat}</div>
              <div>Code QR : {t.qr}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
