import mongoose, { ConnectOptions } from "mongoose";

class Database {
  private static instance: Database;
  private isConnected: boolean = false;
  constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("DB is Already Connected");
      return;
    }
    const uri = process.env.DB_URL || "mongodb://localhost:27017/sarahApp";
    const options: ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
    };
    try {
      const connection = await mongoose.connect(uri, options);
      this.isConnected = connection.connection.readyState === 1;
      console.log("Database connected :)");
    } catch (error: any) {
      console.log("ERROR IN CONNECTION :(", error?.messsage || error);
    }
  }
}

export const database = Database.getInstance();
