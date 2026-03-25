import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "./apiClient";

export function useAnalytics() {
    const location = useLocation();

    useEffect(() => {
        // 1. Envoyer un événement "VUE" à chaque changement de page
        const trackPageView = async () => {
            try {
                await apiFetch("/tracking/activity", {
                    method: "POST",
                    data: {
                        typeAction: "VUE_PAGE",
                        donneeConsultee: location.pathname
                    }
                });
            } catch (e) {
                console.error("Erreur Analytics VUE_PAGE", e);
            }
        };
        trackPageView();
    }, [location.pathname]);

    useEffect(() => {
        // 2. Envoyer un "HEARTBEAT" toutes les 60 secondes pour mesurer le temps passé
        const intervalId = setInterval(async () => {
            try {
                await apiFetch("/tracking/activity", {
                    method: "POST",
                    data: {
                        typeAction: "HEARTBEAT",
                        donneeConsultee: "Temps"
                    }
                });
            } catch (e) {
                console.error("Erreur Analytics HEARTBEAT", e);
            }
        }, 60000); // 60 secondes

        return () => clearInterval(intervalId); // Nettoyage lors de la fermeture
    }, []);
}
