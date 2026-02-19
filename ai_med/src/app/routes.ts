import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Landing } from "./pages/Landing";
import { Prediction } from "./pages/Prediction";
import { ModelInsights } from "./pages/ModelInsights";
import { About } from "./pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "predict", Component: Prediction },
      { path: "insights", Component: ModelInsights },
      { path: "about", Component: About },
    ],
  },
]);
