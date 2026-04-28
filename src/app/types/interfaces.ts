export interface UserIdName {
    userId: string;
    username: string;
}

export enum Role {
    USER = "USER",
    AGENT = "AGENT",
    ADMIN = "ADMIN",
    OWNER = "OWNER",
}
export interface AgentProperties {
    systemInstruction: string;
}