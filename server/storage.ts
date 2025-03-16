import { 
  User, 
  InsertUser, 
  Connection, 
  InsertConnection, 
  WhiteLabelConfig, 
  InsertWhiteLabelConfig 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Connection methods
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionByConnectionId(connectionId: string): Promise<Connection | undefined>;
  getConnectionsByUserId(userId: number): Promise<Connection[]>;
  getActiveConnections(): Promise<Connection[]>;
  updateConnectionStatus(id: number, active: boolean): Promise<Connection | undefined>;
  deleteConnection(id: number): Promise<boolean>;
  
  // White label methods
  createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig>;
  getWhiteLabelConfigByUserId(userId: number): Promise<WhiteLabelConfig | undefined>;
  updateWhiteLabelConfig(id: number, config: Partial<InsertWhiteLabelConfig>): Promise<WhiteLabelConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private connections: Map<number, Connection>;
  private whiteLabelConfigs: Map<number, WhiteLabelConfig>;
  private userId: number;
  private connectionId: number;
  private whiteLabelConfigId: number;

  constructor() {
    this.users = new Map();
    this.connections = new Map();
    this.whiteLabelConfigs = new Map();
    this.userId = 1;
    this.connectionId = 1;
    this.whiteLabelConfigId = 1;
    
    // Add demo admin user
    this.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
      isAdmin: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      isAdmin: insertUser.isAdmin ?? false // Ensure isAdmin is always a boolean
    };
    this.users.set(id, user);
    return user;
  }
  
  // Connection methods
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionId++;
    const now = new Date();
    const newConnection: Connection = {
      id,
      connectionId: connection.connectionId,
      userId: connection.userId ?? null,
      name: connection.name ?? "New Connection",
      password: connection.password ?? null,
      active: connection.active ?? true,
      settings: connection.settings ?? "{}",
      createdAt: now,
      lastActiveAt: now
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }
  
  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }
  
  async getConnectionByConnectionId(connectionId: string): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(
      (conn) => conn.connectionId === connectionId
    );
  }
  
  async getConnectionsByUserId(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.userId === userId
    );
  }
  
  async getActiveConnections(): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.active
    );
  }
  
  async updateConnectionStatus(id: number, active: boolean): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection: Connection = {
      ...connection,
      active,
      lastActiveAt: new Date()
    };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async deleteConnection(id: number): Promise<boolean> {
    return this.connections.delete(id);
  }
  
  // White label methods
  async createWhiteLabelConfig(config: InsertWhiteLabelConfig): Promise<WhiteLabelConfig> {
    const id = this.whiteLabelConfigId++;
    const now = new Date();
    const newConfig: WhiteLabelConfig = {
      id,
      userId: config.userId,
      companyName: config.companyName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.whiteLabelConfigs.set(id, newConfig);
    return newConfig;
  }
  
  async getWhiteLabelConfigByUserId(userId: number): Promise<WhiteLabelConfig | undefined> {
    return Array.from(this.whiteLabelConfigs.values()).find(
      (config) => config.userId === userId
    );
  }
  
  async updateWhiteLabelConfig(id: number, config: Partial<InsertWhiteLabelConfig>): Promise<WhiteLabelConfig | undefined> {
    const existingConfig = this.whiteLabelConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig: WhiteLabelConfig = {
      ...existingConfig,
      companyName: config.companyName ?? existingConfig.companyName,
      primaryColor: config.primaryColor ?? existingConfig.primaryColor,
      logoUrl: config.logoUrl ?? existingConfig.logoUrl,
      updatedAt: new Date()
    };
    this.whiteLabelConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
}

export const storage = new MemStorage();
