import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { App } from "./App";
import { AppPrivate } from "./AppPriv";
const Notes = lazy(() => import("./pages/notes"));
const NotesShow = lazy(() => import("./pages/notes/show"));
const UserNotes = lazy(() => import("./pages/user/notes"));
const UserNotesCreate = lazy(() => import("./pages/user/notes/create"));
const UserNotesShow = lazy(() => import("./pages/user/notes/show"));

export const router = createBrowserRouter([
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
        element: <Notes />,
      },
    ],
  },
]);
