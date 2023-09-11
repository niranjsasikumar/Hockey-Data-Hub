import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/Root"
import ErrorPage from "./routes/ErrorPage";
import Home from "./components/pages/home/Home";
import Scores from "./components/pages/scores/Scores";
import Standings from "./components/pages/standings/Standings";
import Schedule from "./components/pages/schedule/Schedule";
import Stats from "./components/pages/stats/Stats";
import Teams from "./components/pages/teams/Teams";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "scores",
        element: <Scores />
      },
      {
        path: "standings",
        element: <Standings />
      },
      {
        path: "schedule",
        element: <Schedule />
      },
      {
        path: "stats",
        element: <Stats />
      },
      {
        path: "teams",
        element: <Teams />
      }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);