export interface UserIdName {
    userId: string;
    username: string;
}

export enum Role {
    USER = "USER",
    AGENT = "AGENT",
}
export interface AgentProperties {
    systemInstruction: string;
}