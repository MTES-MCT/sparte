// Rend les matchers de jest-dom (toBeInTheDocument, toHaveAttribute, …) connus de TypeScript dans les tests :
// jest.setup.js les enregistre à l'exécution, mais ts-jest a besoin de leurs types.
import '@testing-library/jest-dom';
