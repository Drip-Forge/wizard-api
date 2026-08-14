# wizard-api

A Fastify + TypeScript API service under the **DripForge** organization. It parses `package.json` configurations, validates their properties using **Zod**, and generates a Drips-compatible `FUNDING.json` manifest.

## Endpoints

### 1. `GET /health`
Returns a simple status check.

**Response**:
```json
{
  "status": "OK",
  "service": "wizard-api"
}
```

### 2. `GET /analyze` or `POST /analyze`
Analyzes a `package.json` file and outputs a Drips-compatible `FUNDING.json` structure.

*   **POST Request Body** or **GET Query Param `?packageJson={...}`**:
    Standard `package.json` contents as JSON. Supports a custom `drips` field defining the owner wallet.

    **Example Input**:
    ```json
    {
      "name": "my-drips-project",
      "version": "1.0.0",
      "dependencies": {
        "lodash": "^4.17.21"
      },
      "drips": {
        "ethereum": {
          "ownedBy": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        }
      }
    }
    ```

*   **Response**:
    A valid `FUNDING.json` schema along with helper analysis metadata:
    ```json
    {
      "drips": {
        "ethereum": {
          "ownedBy": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        }
      },
      "_metadata": {
        "projectName": "my-drips-project",
        "analyzedAt": "2026-06-19T12:00:00.000Z",
        "dependenciesCount": 1,
        "devDependenciesCount": 0
      }
    }
    ```

## Development and Building

### Commands

*   **Install dependencies**:
    ```bash
    npm install
    ```
*   **Run local dev server**:
    ```bash
    npm run dev
    ```
*   **Build production files**:
    ```bash
    npm run build
    ```
*   **Start server**:
    ```bash
    npm run start
    ```
