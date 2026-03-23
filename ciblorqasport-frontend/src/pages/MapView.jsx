import React, { useEffect, useState, useContext, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

// Fix Leaflet Default Icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const createIcon = (color) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

const ICONS = {
    EPREUVE: createIcon("blue"),
    COMPETITION: createIcon("violet"),
    CEREMONIE: createIcon("gold"),
    FAN_ZONE: createIcon("green"),
    ATHLETE: createIcon("red"),
};

export default function MapView() {
    const { user } = useAuth();
    const [pois, setPois] = useState([]);
    const [athletes, setAthletes] = useState({});
    const stompClientRef = useRef(null);

    // Paris center
    const center = [48.8566, 2.3522];

    useEffect(() => {
        // 1. Fetch static points (filtered by backend based on role)
        const fetchPoints = async () => {
            try {
                const response = await apiFetch("/map/points");
                setPois(response.data || []);
            } catch (error) {
                console.error("Erreur lors de la récupération des points:", error);
            }
        };
        fetchPoints();

        // 2. Setup WebSocket Tracking (Admin & Commissaires only)
        const canSeeTracking =
            user &&
            user.roles &&
            (user.roles.includes("Administrateur") || user.roles.includes("Commissaire"));

        if (canSeeTracking) {
            console.log("Initialisation de la connexion STOMP pour le tracking...");

            // 1. Fetch initial positions
            const fetchInitialAthletes = async () => {
                try {
                    const res = await apiFetch("/tracking/athletes");
                    const initialMap = {};
                    res.data.forEach(a => {
                        initialMap[a.athleteId] = a;
                    });
                    setAthletes(initialMap);
                } catch (e) {
                    console.error("Initial athletes fetch failed", e);
                }
            };
            fetchInitialAthletes();

            const socket = new SockJS("http://localhost:8080/ws");
            const client = Stomp.over(socket);
            client.debug = () => { }; // Disable noisy debug logs

            client.connect({}, () => {
                console.log("Connecté au STOMP Tracking.");
                // Souscription au topic
                client.subscribe("/topic/tracking", (message) => {
                    if (message.body) {
                        const locationUpdate = JSON.parse(message.body);
                        // Updating athlete positions, avoiding complete re-renders of static points if possible
                        setAthletes((prev) => ({
                            ...prev,
                            [locationUpdate.athleteId]: locationUpdate,
                        }));
                    }
                });
            });

            stompClientRef.current = client;

            return () => {
                if (stompClientRef.current) {
                    stompClientRef.current.disconnect();
                }
            };
        }
    }, [user]);

    const canSeeTracking =
        user &&
        user.roles &&
        (user.roles.includes("Administrateur") || user.roles.includes("Commissaire"));

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-b-4 border-blue-500 pb-2 inline-block">
                        Carte Interactive des Sites
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {canSeeTracking
                            ? "Vue de Supervision Mondiale - Mode: Administrateur / Commissaire"
                            : "Retrouvez les événements, épreuves et Fan Zones à proximité."}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100" style={{ height: "70vh" }}>
                <MapContainer
                    center={center}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Render Static POIs */}
                    {pois.map((poi) => (
                        <Marker
                            key={poi.id}
                            position={[poi.latitude, poi.longitude]}
                            icon={ICONS[poi.type] || ICONS.EPREUVE}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-md">{poi.nom}</h3>
                                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mt-2">
                                        {poi.type}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Render Dynamic Athletes */}
                    {Object.values(athletes).map((athlete) => (
                        <Marker
                            key={athlete.athleteId}
                            position={[athlete.latitude, athlete.longitude]}
                            icon={ICONS.ATHLETE}
                            zIndexOffset={1000} // Keep athletes above normal markers
                        >
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-red-600">{athlete.nom}</h3>
                                    <span className="inline-block bg-red-100 rounded-full px-3 py-1 text-xs font-semibold text-red-700 mt-2 animate-pulse">
                                        En Direct
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
