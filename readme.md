# Setup Project => Saraha App 

## Prerequisites
- Ensure you have Node.js and npm installed on your system.
- Install MongoDB or have access to a MongoDB database.

## Environment Variables
Create a `.env` file in the root directory of your project and add the following environment variables:

```env
SALT_ROUND = 
DB_URL = 
NODE_ENV = 

# EMAIL Configuration
EMAIL = 
PASSWORD = 

SECRETKEY_CRYPTO = 
```

> **Note**: Replace the placeholder values with your actual data.

## Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. To build the project:
   ```bash
   npm run build
   ```

5. To run the project from the build output:
   ```bash
   npm run start
   ```

## Notes
- Make sure the `.env` file is not shared publicly or uploaded to version control to keep sensitive information secure.
- Use `NODE_ENV = "production"` when deploying to a production environment.
