import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        name: "Championnats d'Europe de Natation 200m 4 nages",
        location: "Centre Aquatique Olympique - Paris",
        date: "2026-01-15",
        time: "10:00",
        type: "competition",
      },
      {
        id: 2,
        name: "Water Polo - Poules France vs Italie",
        location: "Piscine Olympique - Dijon",
        date: "2026-01-16",
        time: "14:00",
        type: "competition",
      },
      {
        id: 3,
        name: "Cérémonie d'ouverture",
        location: "Stade Olympique - Paris",
        date: "2026-01-14",
        time: "18:00",
        type: "ceremony",
      },
      {
        id: 4,
        name: "Fan Zone - Paris Centre",
        location: "Place de la République - Paris",
        date: "2026-01-15",
        time: "12:00",
        type: "fun",
      },
    ];

    setEvents(mockEvents);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Événements à venir</h1>
      {events.length === 0 ? (
        <p>Aucun événement disponible.</p>
      ) : (
        <ul style={styles.list}>
          {events.map((event) => (
            <li key={event.id} style={styles.listItem}>
              <h2>{event.name}</h2>
              <p>
                📍 {event.location} <br />
                📅 {event.date} - ⏰ {event.time}
              </p>
              <Link to={`/events/${event.id}`} style={styles.link}>
                Voir le détail
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "50px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
  },
  listItem: {
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  link: {
    marginTop: "10px",
    display: "inline-block",
    color: "#0d6efd",
  },
};
