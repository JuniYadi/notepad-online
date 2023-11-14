import { Suspense, lazy } from "react";
import App from "./App";
import { createBrowserRouter } from "react-router-dom";

const Notes = lazy(() => import("./pages/notes"));
const NotesShow = lazy(() => import("./pages/notes/show"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Notes />,
      },
      {
        path: "/:id",
        element: <NotesShow />,
      },
      {
        path: "/login",
        element: <div>Login</div>,
      },
    ],
  },
]);
