import { useEffect, useRef } from "react";
import { toastSignal, searchStatusSignal } from "../data";
import { Toast } from "bootstrap";

const Toaster = () => {
  const toastElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastSignal.value !== "") {
      console.log(`toast: ${toastSignal.value}`);
      const t = new Toast(toastElRef.current!, {});
      t.show();
    }
  }, [toastSignal.value]);

  const bgClass = searchStatusSignal.value === "error" ? "bg-danger" : "";

  return (
    <div className="position-fixed bottom-0 end-0 p-3">
      <div className="toast mx-auto" ref={toastElRef}>
        <div className={`toast-body d-flex ${bgClass}`}>
          <span className="me-auto">{toastSignal.value}</span>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="toast"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Toaster;
