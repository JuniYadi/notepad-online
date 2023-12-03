import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { App } from "./App";
import { AppPrivate } from "./AppPriv";
import NotFound from "./components/NotFound";
const Notes = lazy(() => import("./pages/notes"));
const NotesCreate = lazy(() => import("./pages/notes/create"));
const NotesShow = lazy(() => import("./pages/notes/show"));
const UserNotes = lazy(() => import("./pages/user/notes"));
const UserNotesCreate = lazy(() => import("./pages/user/notes/create"));
const UserNotesShow = lazy(() => import("./pages/user/notes/show"));
const AdminNotes = lazy(() => import("./pages/admin/notes"));

export const router = createBrowserRouter([
  {
    path: "admin",
    element: <AppPrivate />,
    children: [
      {
        path: "",
        element: <AdminNotes />,
      },
    ],
  },
  {
    path: "app",
    element: <AppPrivate />,
    children: [
      {
        path: "",
        element: <UserNotes />,
      },
      {
        path: "create",
        element: <UserNotesCreate />,
      },
      {
        path: ":id",
        element: <UserNotesShow />,
      },
    ],
  },
  {
    path: "v",
    element: <AppPrivate />,
    children: [
      {
        path: ":id",
        element: <UserNotesShow />,
      },
    ],
  },
  {
    path: "p",
    element: <App />,
    children: [
      {
        path: ":id",
        element: <NotesShow />,
      },
    ],
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <NotesCreate />,
      },
      {
        path: "lists",
        element: <Notes />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
