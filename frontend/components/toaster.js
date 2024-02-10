import { searchStatusSignal, toastSignal } from "../data.js";
import { useSignalEffect, useRef, html, useComputed } from "../preact.js";

export default () => {
  const toastElRef = useRef(null);
  useSignalEffect(() => {
    if (toastSignal.value !== "") {
      console.log(`toast: ${toastSignal.value}`);
      const t = new bootstrap.Toast(toastElRef.current, {});
      t.show();
    }
  });

  const bgClass = useComputed(() =>
    searchStatusSignal.value === "error" ? "bg-danger" : ""
  );
  return html`
    <div class="position-fixed bottom-0 end-0 p-3">
      <div class="toast mx-auto" ref=${toastElRef}>
        <div class="toast-body d-flex ${bgClass}">
          <span class="me-auto">${toastSignal}</span>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="toast"
          ></button>
        </div>
      </div>
    </div>
  `;
};
