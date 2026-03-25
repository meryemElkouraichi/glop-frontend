import { apiFetch } from "./apiClient";

/**
 * Fonction générique pour tracker la consultation d'une rubrique (clic dans le menu ou la cloche)
 */
export const trackAction = async (nomRubrique) => {
    try {
        await apiFetch("/tracking/activity", {
            method: "POST",
            data: {
                typeAction: "CONSULTATION",
                donneeConsultee: nomRubrique,
            },
        });
    } catch (e) {
        console.error("Erreur Analytics CONSULTATION", e);
    }
};
