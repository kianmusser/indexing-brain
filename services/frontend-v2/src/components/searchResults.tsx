import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { searchResultsSignal, searchStatusSignal } from "../data";
import { BsCopy } from "react-icons/bs";

const Divider = (props) => (
  <div class="d-flex mt-2">
    <span>{props.text}</span>
    <hr class="ms-2 flex-grow-1" />
  </div>
);

export default function SearchResults() {
  const createSearchResult = (props) => {
    const isCopied = useSignal(false);
    const copyButtonColor = useComputed(() =>
      isCopied.value === true ? "btn-success" : "btn-primary"
    );
    const copyButtonText = useComputed(() =>
      isCopied.value === true ? "Copied" : "Copy"
    );

    const copyButtonClasses = useComputed(
      () => "m-2 btn " + copyButtonColor.value
    );
    useSignalEffect(() => {
      const s = searchStatusSignal.value;
      isCopied.value = false;
    });
    const copy = async () => {
      isCopied.value = true;
      await navigator.clipboard.writeText(props.name);
    };
    return (
      <div class="card m-1 hstack">
        <div class="py-1 px-3">{props.place}</div>
        <div class="vr my-2"></div>
        <div class="card-body">{props.name}</div>
        <div class="vr my-2"></div>
        <button class={copyButtonClasses} onClick={copy}>
          {copyButtonText} <BsCopy />
        </button>
      </div>
    );
  };
  const specificResults =
    searchResultsSignal.value.specificResults.map(createSearchResult);
  const relatedResults =
    searchResultsSignal.value.relatedResults.map(createSearchResult);
  const extendedResults =
    searchResultsSignal.value.extendedResults.map(createSearchResult);

  return (
    <div class="col-8 mx-auto">
      {specificResults}
      {relatedResults.length > 0 && (
        <Divider text="Results from related locations" />
      )}
      {relatedResults}
      {extendedResults.length > 0 && (
        <Divider text="Results from all other locations" />
      )}
      {extendedResults}
    </div>
  );
}
