import { useEffect, useRef, useState } from "react";

export default function RiskModal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (isOpen && !position) {
      const modalWidth = 384;
      const modalHeight = 300; 
      const centerX = window.innerWidth / 2 - modalWidth / 2;
      const centerY = window.innerHeight / 2 - modalHeight / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [isOpen, position]);

  const startDrag = (e) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setDragging(true);
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: Math.max(0, e.clientY - offset.y),
    });
  };

  const stopDrag = () => setDragging(false);

  const handleClose = () => {
    setPosition(null); // re-center on next open
    onClose();
  };

  if (!isOpen || !position) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-30"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        ref={modalRef}
        className="bg-gray-100 rounded-lg shadow-lg absolute w-96"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div
          className="flex justify-between items-center p-3 cursor-move rounded-t-lg bg-gray-100"
          onMouseDown={startDrag}
        >
          <h2 className="text-lg font-semibold">Add Risk</h2>
          <button
            type="button"
            className="text-white bg-gray-600 hover:bg-gray-800 rounded px-2"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
