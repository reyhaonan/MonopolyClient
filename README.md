# Monopoly Client

This project is a React-based Monopoly game client. It uses TanStack Router for routing and React Query for data fetching.

## Project Structure

The project is structured as follows:

-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `.prettierrc`: Configuration file for Prettier, a code formatter.
-   `eslint.config.js`: Configuration file for ESLint, a JavaScript linter.
-   `index.html`: The main HTML file for the application.
-   `package.json`: Contains metadata about the project, including dependencies and scripts.
-   `pnpm-lock.yaml`: Records the versions of dependencies used in the project.
-   `README.md`: This file, providing an overview of the project.
-   `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`: Configuration files for TypeScript.
-   `vite.config.ts`: Configuration file for Vite, a build tool.
-   `wrangler.toml`: Configuration file for Cloudflare Wrangler, used for deploying the application to Cloudflare Workers.
-   `public/`: Contains static assets such as `favicon.svg`.
-   `src/`: Contains the source code for the application.
    -   `index.css`: Global CSS file.
    -   `main.tsx`: The entry point for the React application.
    -   `routeTree.gen.ts`: Automatically generated file defining the routes for the application.
    -   `vite-env.d.ts`: TypeScript declaration file for Vite environment variables.
    -   `assets/`: Contains assets such as images and icons.
    -   `components/`: Contains React components.
        -   `atoms/`: Contains atomic components such as `Button`, `PlayerIndicator`, and icons.
        -   `molecules/`: Contains molecule components such as `Modal`, `PropertyTile`, `SpecialTile`, `TradeModal`, and `WinningModal`.
        -   `organisms/`: Contains organism components such as `Board`, `GameConfigForm`, `Navbar`, `PlayersInfo`, `PlayersPawnsRender`, `TradeSection`, and `TransactionHistory`.
        -   `pages/`: Contains page components such as `GameView`, `HomeView`, `LoginView`, and `OldGameView`.
        -   `providers/`: Contains provider components such as `AuthProvider`.
        -   `templates/`: Contains template components.
    -   `context/`: Contains React context files such as `AuthContext` and `GameConfigContext`.
    -   `enums/`: Contains enums such as `ColorGroup`, `GamePhase`, `RentStage`, and `TransactionType`.
    -   `hooks/`: Contains custom React hooks such as `useAuth`, `useGameConfig`, and `useGameManager`.
    -   `routes/`: Contains route definitions.
    -   `services/`: Contains API service files such as `auth.ts` and `game.ts`.
    -   `types/`: Contains TypeScript type definitions.
    -   `utils/`: Contains utility files such as `axiosInstance.ts` and `cookie.ts`.
    -   `views/`: Contains view components.

## Dependencies

-   `@tanstack/react-query`: For data fetching.
-   `@tanstack/react-router`: For routing.
-   `react`: For building the user interface.
-   `react-dom`: For rendering React components in the browser.
-   `immer`: For working with immutable data.

## Running the Application

To run the application, you need to have Node.js and pnpm installed. Then, run the following commands:

```bash
pnpm install
pnpm run dev
```

This will start the development server. Open your browser and navigate to `http://localhost:5173` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
