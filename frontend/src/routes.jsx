import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { App } from "./App";
import { AppPrivate } from "./AppPriv";
const Notes = lazy(() => import("./pages/notes"));
const NotesShow = lazy(() => import("./pages/notes/show"));
const UserNotes = lazy(() => import("./pages/user/notes"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Notes />,
      },
      {
        path: "/:id",
        element: <NotesShow />,
      },
    ],
  },
  {
    path: "app",
    element: <AppPrivate />,
    children: [
      {
        path: "notes",
        element: <UserNotes />,
      },
    ],
  },
]);
