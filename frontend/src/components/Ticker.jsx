import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Ticker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.listarCatalogo().then(setItems).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // Se duplica la lista para lograr un scroll continuo sin saltos.
  const recorrido = [...items, ...items];

  return (
    <div className="ticker-strip" aria-hidden="true">
      <div className="ticker-track">
        {recorrido.map((item, i) => (
          <span className="ticker-item" key={`${item.id}-${i}`}>
            <strong>{item.simbolo}</strong>
            <span className="ticker-price">${Number(item.precio).toFixed(2)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
