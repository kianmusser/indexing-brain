import {
  doSearch,
  locationsSignal,
  searchParametersSignal,
  searchStatusSignal,
} from "../data";

import { BsSearch } from "react-icons/bs";
import {
  Button,
  ButtonGroup,
  Form,
  InputGroup,
  Nav,
  Row,
  Spinner,
} from "react-bootstrap";
import { useComputed } from "@preact/signals";

export default function Header() {
  const searchButtonVariant = useComputed(() => {
    switch (searchStatusSignal.value) {
      case "ok":
        return "primary";
      case "error":
        return "danger";
      default:
        return "warning";
    }
  });

  const locationOptions = useComputed(() => {
    return locationsSignal.value.map((l) => (
      <option value={l.abbr}>{l.name}</option>
    ));
  });

  return (
    <Nav>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
        }}
      >
        <Form.Group as={Row} controlId="formLocation">
          <Form.Select
            size="lg"
            value={searchParametersSignal.value.curLocation}
            onChange={(e) =>
              (searchParametersSignal.value.curLocation.value = e.target.value)
            }
          >
            {locationOptions}
          </Form.Select>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Check type="radio" label="Names"></Form.Check>
        </Form.Group>
      </Form>
    </Nav>
  );
}

/*
	<div class="col"
	<input type="text">
		<input type="radio" name="type" id="type-names" class="btn-check">
		<input type="radio" name="type" id="type-places" class="btn-check">
		<input type="radio" name="type" id="type-other" class="btn-check">
		<label for="type-names" class="btn btn-primary fs-3">Names</label>
		<label for="type-places" class="btn btn-primary fs-3">Places</label>
		<label for="type-other" class="btn btn-primary fs-3">Other</label>
	</div>

          <select
            class="col form-select fs-3"
            id="type"
            value={searchParametersSignal.value.nameType}
            onChange={(e) =>
              (searchParametersSignal.value.nameType.value = e.target.value)
            }
          >
            <option value="N">Names</option>
            <option value="P">Places</option>
            <option value="O">Other</option>
          </select>

          <div class="input-group col">
            <input
              type="text"
              class="form-control fs-3"
              id="query"
              placeholder="Search"
              value={searchParametersSignal.value.query}
              onInput={(e) =>
                (searchParametersSignal.value.query.value = e.target.value)
              }
            />
            <Button variant={searchButtonVariant.value} onClick={doSearch}>
              {searchButtonVariant.value === "warning" ? (
                <Spinner size="sm" />
              ) : (
                <BsSearch />
              )}
            </Button>
          </div>
          */
