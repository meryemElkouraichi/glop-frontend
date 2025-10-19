import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    apiFetch(`/events/${id}`).then((r) => setEvent(r.data || { title: "Épreuve inconnue" }));
  }, [id]);

  if (!event) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
      <p><strong>Lieu :</strong> {event.location?.name || "N/A"}</p>
      <p><strong>Date :</strong> {event.date || "À définir"}</p>
    </div>
  );
}
