import "@/shared/observability/sentry";

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyAccentColor, getEffectiveAccentColor } from "@/shared/theme/accent-color";

applyAccentColor(getEffectiveAccentColor());

createRoot(document.getElementById("root")!).render(<App />);
