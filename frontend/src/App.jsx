import { Suspense } from "react";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { APP_NAME } from "./statics";

export const App = () => {
  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        sticky="top"
        bg="primary"
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Brand href="/">{APP_NAME}</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/lists">
                My Notes
              </Nav.Link>
              <Nav.Link
                href="https://forms.gle/rQkyMrvbeACoFTny9"
                target="_blank"
              >
                Isi Survey
              </Nav.Link>
              <Nav.Link as={Link} to="/about">
                About Us
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/app">
                Login / Register
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-2">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Container>
    </>
  );
};
