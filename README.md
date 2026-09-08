# NocoDB

> Quickly access the tables in your NocoDB bases

## 🎯 Features

- Lists every table across every base on your self-hosted NocoDB instance, grouped by base, in one searchable list.
- Open a table directly in your browser (its default view), or copy the link.
- Results are cached for 5 minutes so repeat opens are instant; use **Refresh** to force a reload.

## 🚀 Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) (recommended version 24 or higher)

### Installation

### Build From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/brpaz/vicinae-nocodb-bases.git
2. Navigate to the project directory:
   ```bash
   cd nocodb-bases
3. Install dependencies:
   ```bash
   npm i
4. Build the project:
   ```bash
   npm run build
   ```

This will install the extension in `~/.local/share/vicinae/extensions`, and will be available immediately on your Vicinae app.

## Development

In development, you can use the following command to watch for changes and rebuild your extension automatically:

```bash
npm run dev
```

## 🧰 Usage

Set the **NocoDB URL** and **API Token** preferences (an API token can be created under Account Settings > Tokens in NocoDB), then open **Search Tables**. Hit Enter on a table to open its default view in your browser, or use **Copy Link**.

### Requirements

- A self-hosted NocoDB instance (OSS meta API — this doesn't target NocoDB Cloud's separate API).
- The dashboard URL scheme (`/dashboard/#/v/<workspace>/<base>/<table>/<view>/`) was confirmed against a real instance, not from NocoDB's docs (which don't document it) — if your instance uses a different NocoDB version with a different URL scheme, opening a table may 404 even though the underlying data fetch is correct.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.