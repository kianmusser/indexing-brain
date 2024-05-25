import {
  doSearch,
  locationsSignal,
  searchParametersSignal,
  searchStatusSignal,
} from "../data";

import { BsSearch } from "react-icons/bs";
import { Form, Nav, Row, Spinner } from "react-bootstrap";
import { useComputed } from "@preact/signals-react";

import { FC } from "react";

interface Location {
  abbr: string;
  name: string;
}

const Header: FC = () => {
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
    return locationsSignal.value.map((l: Location) => (
      <option key={l.abbr} value={l.abbr}>{l.name}</option>
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
            {locationOptions.value}
          </Form.Select>
        </Form.Group>
        <Form.Group as={Row} controlId="formType">
          <Form.Check
            type="radio"
            name="type"
            id="type-names"
            label="Names"
            checked={searchParametersSignal.value.nameType === "N"}
            onChange={() => (searchParametersSignal.value.nameType.value = "N")}
          />
          <Form.Check
            type="radio"
            name="type"
            id="type-places"
            label="Places"
            checked={searchParametersSignal.value.nameType === "P"}
            onChange={() => (searchParametersSignal.value.nameType.value = "P")}
          />
          <Form.Check
            type="radio"
            name="type"
            id="type-other"
            label="Other"
            checked={searchParametersSignal.value.nameType === "O"}
            onChange={() => (searchParametersSignal.value.nameType.value = "O")}
          />
        </Form.Group>
        <Form.Group as={Row} controlId="formQuery">
          <Form.Control
            type="text"
            placeholder="Search"
            size="lg"
            value={searchParametersSignal.value.query}
            onChange={(e) =>
              (searchParametersSignal.value.query.value = e.target.value)
            }
          />
          <button
            type="button"
            className={`btn btn-${searchButtonVariant.value}`}
            onClick={doSearch}
          >
            {searchButtonVariant.value === "warning" ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <BsSearch />
            )}
          </button>
        </Form.Group>
      </Form>
    </Nav>
  );
};

export default Header;
