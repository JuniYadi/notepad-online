import { Suspense, useEffect, useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import {
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";
import SHA256 from "crypto-js/sha256";
import { UserContext } from "./contexts";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

const AppPriv = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    gravatar: "",
    isVerified: false,
    isAdmin: false,
    tokens: {},
  });

  const onSignOut = async (e) => {
    e.preventDefault();

    await signOut();
    window.location.href = "/app/notes";
  };

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes(user);
      const { idToken } = (await fetchAuthSession()).tokens || {};

      // get cognito groups
      const groups = idToken?.payload["cognito:groups"] || [];

      // hash email for gravatar
      const emailHash = SHA256(
        attributes?.email.toLocaleLowerCase()
      ).toString();

      setUser({
        username: user?.username,
        email: attributes?.email,
        gravatar: `https://www.gravatar.com/avatar/${emailHash}?s=45&d=identicon`,
        isVerified: attributes?.email_verified,
        isAdmin: groups.includes("administrator"),
        tokens: idToken?.toString(),
      });
    };

    getUser();
  }, []);

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
          <Navbar.Brand href="/">MyNotes</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/app">
                My Notes
              </Nav.Link>
              <Nav.Link as={Link} to="/app/create">
                Create New Note
              </Nav.Link>
              {/* <NavDropdown title="Help" id="collapsible-nav-dropdown">
                <NavDropdown.Item href="#action/3.2">
                  Email Support
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Call Support
                </NavDropdown.Item>
              </NavDropdown> */}
            </Nav>
            <Nav>
              <picture>
                <img
                  src={user?.gravatar}
                  alt="avatar"
                  className="rounded-circle img-thumbnail hide-on-mobile me-2"
                />
              </picture>
              <NavDropdown title={user?.email} id="collapsible-nav-dropdown">
                <NavDropdown.Item href="#grant">
                  Status {user?.isVerified ? "Verified ✅" : "Unverified ❌"}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#grant">
                  {user?.isAdmin ? "Admin Access" : "User Access"}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#signout" onClick={onSignOut}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-2">
        <UserContext.Provider value={user}>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </UserContext.Provider>
      </Container>
    </>
  );
};

export const AppPrivate = withAuthenticator(AppPriv);
