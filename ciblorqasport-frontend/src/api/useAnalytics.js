import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "./apiClient";

/**
 * Fonction générique pour tracker n'importe quelle action précise (clic sur un onglet, bouton...)
 */
export const trackAction = async (donneeConsultee) => {
    try {
        await apiFetch("/tracking/activity", {
            method: "POST",
            data: {
                typeAction: "VUE_RUBRIQUE",
                donneeConsultee: donneeConsultee,
            },
        });
    } catch (e) {
        console.error("Erreur Analytics VUE_RUBRIQUE", e);
    }
};

export function useAnalytics() {
    const location = useLocation();

    useEffect(() => {
        // 1. Envoyer un événement de navigation global (URL)
        const trackPageView = async () => {
            try {
                await apiFetch("/tracking/activity", {
                    method: "POST",
                    data: {
                        typeAction: "VUE_PAGE",
                        donneeConsultee: location.pathname,
                    },
                });
            } catch (e) {
                console.error("Erreur Analytics VUE_PAGE", e);
            }
        };
        trackPageView();
    }, [location.pathname]);
}
