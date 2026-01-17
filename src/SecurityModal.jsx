import { useState } from "react";

function SecurityModal({ onSuccess, onCancel }) {
  const PATRON_CORRECTO =
    localStorage.getItem("appPattern") || "1-2-5-8";
  const PIN_CORRECTO =
    localStorage.getItem("appPin") || "123456";

  const [patternInput, setPatternInput] = useState([]);
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const isLocked = Date.now() < lockedUntil;

  const failAccess = () => {
    const tries = attempts + 1;
    setAttempts(tries);
    setError("Acceso incorrecto 😬");
    setPatternInput([]);
    setPin("");

    if (tries >= 3) {
      setLockedUntil(Date.now() + 60 * 1000);
      setAttempts(0);
      setError("Bloqueado por 1 minuto 🔒");
    } else {
      setUsePin(true);
    }
  };

  const checkPattern = () => {
    if (patternInput.join("-") === PATRON_CORRECTO) {
      onSuccess();
    } else {
      failAccess();
    }
  };

  const checkPin = () => {
    if (pin === PIN_CORRECTO) {
      onSuccess();
    } else {
      failAccess();
    }
  };

  return (
    <div className="pin-overlay">
      <div className="pin-modal">
        <h3>🔐 Seguridad</h3>

        {isLocked ? (
          <p className="error">Bloqueado ⏳</p>
        ) : !usePin ? (
          <>
            <p>Dibuja el patrón</p>
            <div className="pattern-grid">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button
                  key={n}
                  className={
                    patternInput.includes(n)
                      ? "pattern-dot active"
                      : "pattern-dot"
                  }
                  onClick={() =>
                    !patternInput.includes(n) &&
                    setPatternInput([...patternInput, n])
                  }
                />
              ))}
            </div>
            <button onClick={checkPattern}>Confirmar patrón</button>
          </>
        ) : (
          <>
            <p>Ingresa PIN</p>
            <div className="pin-display">
              {"●".repeat(pin.length)}
            </div>
            <div className="pin-keyboard">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => pin.length < 6 && setPin(pin + n)}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPin("")}>⌫</button>
              <button onClick={() => pin.length < 6 && setPin(pin + "0")}>0</button>
              <button onClick={checkPin}>✔</button>
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <button className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default SecurityModal;
