# NocoDB

> Quickly access the tables in your NocoDB bases

## 🎯 Features

- Lists every base on your self-hosted NocoDB instance.
- Drill down into a base to search its tables, open one in your browser, or copy the link.

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

Set the **NocoDB URL** and **API Token** preferences (an API token can be created under Account Settings > Tokens in NocoDB), then open **Search Bases**. Select a base and use **View Tables** to drill down and search its tables, or **Open Base in Browser** / **Copy Link** to jump to the base itself.

### Requirements

- A self-hosted NocoDB instance (OSS meta API — this doesn't target NocoDB Cloud's separate API).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
