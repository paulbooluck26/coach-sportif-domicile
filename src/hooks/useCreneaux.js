import { useState, useEffect } from "react";
import { fetchDisponibilites, fetchSeancesReservees } from "@/lib/creneaux";

/**
 * Charge une fois les disponibilités et les séances réservées,
 * les expose et fournit un rechargement manuel.
 */
export function useCreneaux() {
  const [recurrentes, setRecurrentes] = useState([]);
  const [blocages, setBlocages] = useState([]);
  const [reservees, setReservees] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [dispos, seances] = await Promise.all([
      fetchDisponibilites(),
      fetchSeancesReservees(),
    ]);
    setRecurrentes(dispos.filter((d) => d.type === "recurrent"));
    setBlocages(dispos.filter((d) => d.type === "blocage"));
    setReservees(seances);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return { recurrentes, blocages, reservees, loading, reload: load };
}