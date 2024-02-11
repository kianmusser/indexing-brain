import { html, useSignal, useComputed, useSignalEffect } from "../preact.js";
import { CopyIcon } from "../icons.js";
import { searchResultsSignal, searchStatusSignal } from "../data.js";

export default () => {
  const createSearchResult = (props) => {
    const isCopied = useSignal(false);
    const copyButtonColor = useComputed(() =>
      isCopied.value === true ? "btn-success" : "btn-primary"
    );
    const copyButtonText = useComputed(() =>
      isCopied.value === true ? "Copied" : "Copy"
    );
    useSignalEffect(() => {
      const s = searchStatusSignal.value;
      isCopied.value = false;
    });
    const copy = async () => {
      isCopied.value = true;
      await navigator.clipboard.writeText(props.name);
    };
    return html`
      <div class="card m-1 hstack">
        <div class="py-1 px-3">${props.place}</div>
        <div class="vr my-2"></div>
        <div class="card-body">${props.name}</div>
        <div class="vr my-2"></div>
        <button class="btn ${copyButtonColor.value} m-2" onClick=${copy}>
          ${copyButtonText} ${CopyIcon}
        </button>
      </div>
    `;
  };
  return html` <div class="col-8 mx-auto">
    ${searchResultsSignal.value.specificResults.map(createSearchResult)}
  </div>`;
};
