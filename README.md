# dApp ROBONOMICS NETWORK

dApp on the Robonomics network. Provides a view and interaction layer from a browser.

## Development

Contributions are welcome!

This repository uses `npm` to organize the code. As such, after cloning, dependencies should be installed via npm.
[Vue.js](https://vuejs.org/) framework is used to create user interfaces.

### Prerequisites

Ensure that you have a recent LTS version of Node.js. For development purposes Node >= 24 is recommended.

### Getting Started

```bash
git clone https://github.com/airalab/robonomics.app <optional local path>
cd robonomics.app
npm i
```

Launch the UI (assuming you have a local Polkadot Node running):

```bash
npm run dev
```

Access the UI via [http://localhost:5173](http://localhost:5173)

## Development and Deployment Rules

### Branches

- **`dev`** — main development branch.
  All new features, bug fixes and changes are made here.
  **Every push to `dev`** automatically builds and deploys the project to **dev.robonomics.app**.

- **`master`** — stable production branch.
  Only ready and tested code should be merged here.
  Direct pushes to `master` are not allowed.

> **Rule:** All development happens only in the `dev` branch.
> The `master` branch is used exclusively for production releases.

### How to Deploy to Dev Environment

1. Switch to the `dev` branch:

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. Make your changes and commit.

3. Push to `dev`:

   ```bash
   git push origin dev
   ```

4. Changes will appear on [dev.robonomics.app](https://dev.robonomics.app) within 1–2 minutes.

### How to Release to Production

1. Create a Pull Request from `dev` → `master`.
2. After review and merge, changes will be automatically published to [robonomics.app](https://robonomics.app).
