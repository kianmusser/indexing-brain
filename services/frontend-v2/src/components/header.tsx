import {
  doSearch,
  locationsSignal,
  searchParametersSignal,
  searchStatusSignal,
} from "../data";

import { BsSearch } from "react-icons/bs";
import { Form, Nav, Row, Spinner } from "react-bootstrap";
import { useComputed } from "@preact/signals";

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
      <option key={l.abbr} value={l.abbr}>
        {l.name}
      </option>
    ));
  });

  return (
    <Nav className="d-flex flex-row">
      <Form
        className="d-flex flex-row align-items-center"
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
        }}
      >
        <Form.Group controlId="formLocation" className="me-2">
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
        <Form.Group
          controlId="formType"
          className="me-2 d-flex flex-row align-items-center"
        >
          <Form.Check
            type="radio"
            name="type"
            id="type-names"
            label="Names"
            checked={searchParametersSignal.value.nameType.value === "N"}
            onChange={() => (searchParametersSignal.value.nameType.value = "N")}
            className="me-2"
          />
          <Form.Check
            type="radio"
            name="type"
            id="type-places"
            label="Places"
            checked={searchParametersSignal.value.nameType.value === "P"}
            onChange={() => (searchParametersSignal.value.nameType.value = "P")}
            className="me-2"
          />
          <Form.Check
            type="radio"
            name="type"
            id="type-other"
            label="Other"
            checked={searchParametersSignal.value.nameType.value === "O"}
            onChange={() => (searchParametersSignal.value.nameType.value = "O")}
            className="me-2"
          />
        </Form.Group>
        <Form.Group
          controlId="formQuery"
          className="me-2 d-flex flex-row align-items-center"
        >
          <Form.Control
            type="text"
            placeholder="Search"
            size="lg"
            value={searchParametersSignal.value.query.value}
            onChange={(e) => {
              // @ts-ignore
              searchParametersSignal.value.query.value = e.target.value;
            }}
            className="me-2"
          />
          <button
            type="button"
            className={`btn btn-${searchButtonVariant.value}`}
            onClick={doSearch}
          >
            {searchButtonVariant.value === "warning" ? (
              <Spinner
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
