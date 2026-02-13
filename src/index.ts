import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import { createApp } from "./app";

const app = createApp();

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

if (require.main === module) {
    startServer();
}

export { app, startServer };
