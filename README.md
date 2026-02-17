# Max Bot Mini App

A modern trading and portfolio management Telegram Mini App built on the MAX ecosystem. This application allows users to monitor their investments, view trading history, and execute orders directly within the messenger interface.

## 🚀 Overview

Max Bot Mini App provides a seamless interface for individual investors to:
- **Monitor Portfolios**: Real-time evaluation and performance tracking across multiple portfolios.
- **Trade Securities**: Execute Market and Limit orders on various exchanges (MOEX, SPBX).
- **Manage History**: Comprehensive view of current positions, past trades, and active orders.
- **Discover Ideas**: Access curated investment signals and strategies.

## 🛠 Tech Stack

- **Core**: [React 19](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [@maxhub/max-ui](https://github.com/max-messenger/max-ui) (Tailored for MAX ecosystem)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: React Hooks & [RxJS](https://rxjs.dev/)
- **Translation**: [i18next](https://www.i18next.com/) with `react-i18next`
- **Build Tool**: [Create React App](https://create-react-app.dev/) with [CRACO](https://craco.js.org/) for configuration overrides.
- **Package Manager**: `pnpm`

## 🏗 Project Structure

```text
src/
├── api/            # API client, service layer, and token management
├── auth/           # Authentication context and route guards
├── components/     # Reusable UI components
├── locales/        # i18n translation files (JSON)
├── pages/          # Page components (Home, Order Detail, Create Order, etc.)
│   ├── home/       # Home dashboard widgets (Positions, Trades, Portfolios)
│   └── auth/       # Login, SSO Callback, and Unlock pages
├── App.tsx         # Root routing and providers
└── index.tsx       # Entry point
```

## 🔐 Authentication & Security

The app uses a robust SSO-based authentication flow:
1. **SSO Redirect**: Users are redirected to the MAX platform's SSO service.
2. **JWT Injection**: After successful login, a JWT is received and stored securely.
3. **Token Management**: Automatic token refresh via `AuthService` and `token-manager.ts`.
4. **Secure Routes**: `RequireAuth` wrapper ensures all trading features are protected.

## 🌐 Internationalization (i18n)

Multilingual support is built-in using `i18next`.
- **Supported Languages**: English and Russian (expandable).
- **Dynamic Loading**: Translations are managed in `src/locales/`.
- **Detection**: Automatically detects user language or defaults to English.

## ⚙️ Development

### Prerequisites
- Node.js (Latest LTS)
- `pnpm` installed globally (`npm install -g pnpm`)

### Installation
```bash
pnpm install
```

### Running Locally (Development)
```bash
pnpm start
```
Starts the development server at `http://localhost:3000`.

### Building for Production
```bash
pnpm run build
```
Generates a production-ready bundle in the `build/` directory.

### Preview Production Build
You can serve the production build locally using a static server:
```bash
pnpm dlx serve -s build
```

### Configuration & Environments

The application uses an environment-based configuration system similar to Angular. Configuration files are located in `src/environments/`:

- `src/environments/environment.ts`: Production configuration (default).
- `src/environments/environment.dev.ts`: Development configuration.

The active configuration is automatically selected based on the `NODE_ENV` environment variable:
- When running `pnpm start`, the **development** configuration is used.
- When running `pnpm run build`, the **production** configuration is used.

To customize URLs, modify the respective file in the `src/environments/` directory.

## 🐳 Docker Production Deployment

For production, the app is served using **Nginx** inside a lightweight Docker container.

### 1. Build Docker Image
```bash
docker build -t max-bot-app .
```

### 2. Run Container
```bash
docker run -d -p 8080:80 --name max-bot-container max-bot-app
```
The app will be accessible at `http://localhost:8080`.

### 📝 Deployment Details
- **Base Image**: `nginx:stable-alpine`
- **Multi-stage Build**: Uses a `node` stage to build the app with `pnpm`, then copies artifacts to `nginx`.
- **SPA Routing**: A custom `nginx.conf` is included to handle client-side routing (`try_files $uri /index.html`).
- **Configuration**: Any custom Nginx settings can be modified in `nginx.conf`.

## 📖 Related Documentation

- [MAX Developer Documentation](./max-docs/README.md) - Platform-wide guides.
- [MAX UI Components](./max-docs/MAX_UI/README.md) - UI library documentation.

---
*Built with ❤️ for the MAX ecosystem.*
