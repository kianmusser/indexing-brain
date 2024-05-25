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
};

export default Header;
