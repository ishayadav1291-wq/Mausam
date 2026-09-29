# Contributing to Mausam

Thank you for your interest in improving Mausam! We welcome contributions to persona algorithms, meteorological integrations, translations, UI enhancements, and documentation.

## Development Workflow

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/<your-username>/hkjdfnskjs.git
   cd hkjdfnskjs
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Run Linting & Automated Tests:**
   Before submitting your PR, ensure all tests and type checks pass:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

## Commit Message Guidelines
We follow standard conventional commit conventions:
- `feat: add uv exposure tracking for health persona`
- `fix: resolve tidal forecast calculation edge case`
- `docs: update deployment instructions for cloud run`
- `test: add unit test for commuter delay matrix`

## Submitting Pull Requests
- Open a Pull Request against the `main` branch.
- Include a descriptive summary of your changes and test verification results.
