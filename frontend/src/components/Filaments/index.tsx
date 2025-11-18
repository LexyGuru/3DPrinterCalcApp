// Re-export the main Filaments component from the parent directory
// This allows importing from "./components/Filaments" to work correctly
export { Filaments } from "../Filaments";

// Export sub-components for potential reuse
export { FilamentSearch } from "./FilamentSearch";
export { FilamentPriceHistory } from "./FilamentPriceHistory";
export { FilamentImageUpload } from "./FilamentImageUpload";
