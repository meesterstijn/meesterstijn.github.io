import { useEffect, useRef, useState } from "react";

// Gedeelde "trek een leerling"-animatie/logica. Alle Beurtstokjes-achtige
// widgets (losse tool, Klastools, Whiteboard) gebruiken deze, zodat de
// random-selectielogica niet per plek gedupliceerd hoeft te worden.
export const useBeurtstokjesTrekker = (namen: string[], resetKey?: string | null) => {
  const [display, setDisplay] = useState("");
  const [gekozen, setGekozen] = useState<string | null>(null);
  const [draaien, setDraaien] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bij het wisselen van actieve klas moet een eerder getrokken naam niet
  // blijven staan — anders lijkt het net of die leerling uit de nieuwe klas komt.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplay("");
    setGekozen(null);
    setDraaien(false);
  }, [resetKey]);

  const trek = () => {
    if (draaien || namen.length === 0) return;
    setGekozen(null);
    setDraaien(true);

    const winnaar = namen[Math.floor(Math.random() * namen.length)];
    const pool    = namen.length > 1 ? namen : [winnaar];

    let stap = 0;
    const stapMax = 15; // ~1 seconde totaal

    const volgende = () => {
      stap++;
      setDisplay(pool[Math.floor(Math.random() * pool.length)]);
      if (stap < stapMax) {
        const delay = 30 + Math.pow(stap / stapMax, 2) * 100;
        timerRef.current = setTimeout(volgende, delay);
      } else {
        setDisplay(winnaar);
        setGekozen(winnaar);
        setDraaien(false);
      }
    };
    volgende();
  };

  return { display, gekozen, draaien, trek };
};
