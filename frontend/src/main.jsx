import React from "react";
import ReactDOM from "react-dom/client";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";
import { SWRConfig } from "swr";
import { HelmetProvider } from "react-helmet-async";

import "./scss/styles.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <React.StrictMode>
      <SWRConfig
        value={{
          refreshInterval: 30000,
          suspense: false,
          fetcher: (url, token, queryParam) =>
            fetch(
              queryParam ? `${url}?${queryParam}` : url,
              token
                ? {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                : undefined
            ).then((res) => res.json()),
        }}
      >
        <RouterProvider router={router} />
      </SWRConfig>
    </React.StrictMode>
  </HelmetProvider>
);
