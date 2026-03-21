export interface System {
  id: string;
  name: string;
  version: string;
  metadata: Record<string, any>;
  defaultAgentId: string;
  defaultProviderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfig {
  system: System;
  providers: ModelProvider[];
  agents: Record<string, AgentConfig>;
  skills: Record<string, SkillConfig>;
}

export interface AgentConfig {
  id: string;
  name: string;
  defaultModelId: string;
  skillIds: string[];
  capabilityPath: string;
  soulPath: string;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface User {
  id: string;
  name: string;
  systemId: string;
  agentId: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  theme?: string;
  notificationEnabled: boolean;
  defaultModelId?: string;
}

export interface Agent {
  id: string;
  name: string;
  systemId: string;
  defaultModelId: string;
  skillIds: string[];
  capability: Capability;
  soul: Soul;
  createdAt: string;
  updatedAt: string;
}

export interface Capability {
  agentId: string;
  features: string[];
  permissions: Permission[];
  boundaries: Boundary[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Boundary {
  type: 'forbid' | 'restrict' | 'warn';
  scope: string;
  description: string;
}

export interface Soul {
  agentId: string;
  identity: string;
  personality: Personality;
  memory: Memory[];
  coreMemories: CoreMemory[];
}

export interface Personality {
  traits: Record<string, number>;
  communicationStyle: string;
  values: string[];
}

export interface Memory {
  id: string;
  type: 'episodic' | 'semantic';
  content: string;
  importance: number;
  timestamp: string;
}

export interface CoreMemory {
  key: string;
  value: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  instructions: string;
  contextFormat: string;
  outputFormat: string;
  constraints: SkillConstraint[];
  scripts: string[];
  resources: string[];
  triggerConditions: TriggerCondition[];
}

export interface SkillConstraint {
  type: 'input' | 'output' | 'behavior';
  rule: string;
  action: 'block' | 'warn' | 'modify';
}

export interface TriggerCondition {
  type: 'keyword' | 'pattern' | 'intent';
  pattern: string;
  weight: number;
}

export interface Session {
  id: string;
  userId: string;
  agentId: string;
  modelId: string;
  providerId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  metadata: Record<string, any>;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'error';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: MessageContent;
  modelId?: string;
  providerId?: string;
  skillId?: string;
  artifacts: string[];
  createdAt: string;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageContent {
  type: 'text' | 'image' | 'audio' | 'file' | 'tool_call' | 'tool_result';
  text?: string;
  url?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  success: boolean;
  output?: string;
  error?: string;
}

export interface Artifact {
  id: string;
  sessionId: string;
  type: ArtifactType;
  name: string;
  content: any;
  mimeType: string;
  size: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type ArtifactType = 'document' | 'code' | 'image' | 'data' | 'config' | 'other';

export type ProviderType = 'openai' | 'anthropic' | 'openrouter' | 'perplexity' | 'custom';

export interface ModelProvider {
  id: string;
  name: string;
  providerType: ProviderType;
  apiEndpoint: string;
  apiKey?: string;
  capabilities: string[];
  supportedModels: string[];
  defaults: ModelDefaults;
  fallbackProviderId?: string;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
}

export interface ModelDefaults {
  temperature: number;
  maxTokens: number;
  topP: number;
  timeout: number;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  retryOn: string[];
}

export interface CacheConfig {
  enabled: boolean;
  ttlMinutes: number;
  maxSize: number;
}

export class ConstraintViolationError extends Error {
  constructor(
    message: string,
    public violatedConstraint: string,
    public blockedByLevel: 'system' | 'agent' | 'skill',
    public attemptedAction: string
  ) {
    super(message);
    this.name = 'ConstraintViolationError';
  }
}

export class ProviderNotFoundError extends Error {
  constructor(providerId: string) {
    super(`Provider not found: ${providerId}`);
    this.name = 'ProviderNotFoundError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class SkillExecutionError extends Error {
  constructor(
    message: string,
    public skillId: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SkillExecutionError';
  }
}

export interface ApiKeyDetection {
  provider: 'openai' | 'anthropic' | 'openrouter' | 'perplexity' | 'custom';
  baseUrl: string;
  modelPrefix?: string;
}

export interface ConfigService {
  loadSystemConfig(): SystemConfig;
  getProvider(providerId: string): ModelProvider | null;
  listProviders(): ModelProvider[];
  getDefaultProvider(): ModelProvider;
  detectApiKeyFormat(apiKey: string): ApiKeyDetection;
  registerProvider(provider: ModelProvider): void;
  reloadConfig(): void;
}

export interface AgentService {
  getAgent(agentId: string): Agent;
  listAgents(): Agent[];
  getDefaultAgent(): Agent;
  createAgent(agentId: string): Agent;
  updateSoul(agentId: string, soul: Soul): void;
  bindUserToAgent(userId: string, agentId: string): void;
  getAgentForUser(userId: string): Agent;
}

export interface SendMessageResult {
  response: AssistantMessage;
  artifacts: Artifact[];
  routedTo?: {
    type: 'skill' | 'model';
    targetId: string;
  };
}

export interface AssistantMessage {
  id: string;
  sessionId: string;
  role: 'assistant';
  content: MessageContent;
  modelId: string;
  providerId: string;
  artifacts: string[];
  createdAt: string;
}

export interface SessionService {
  createSession(userId: string, agentId?: string): Session;
  sendMessage(sessionId: string, message: Message): Promise<SendMessageResult>;
  getSessionHistory(sessionId: string): Message[];
  getSession(sessionId: string): Session | null;
  deleteSession(sessionId: string): void;
  addMessage(sessionId: string, message: Message): void;
}

export interface SkillContext {
  sessionId: string;
  userId: string;
  agentId: string;
  currentPrompt: string;
  artifacts: Artifact[];
  history: Message[];
}

export interface SkillResult {
  success: boolean;
  output?: string;
  artifacts?: Artifact[];
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface SkillService {
  loadSkill(skillId: string): Skill;
  listAgentSkills(agentId: string): Skill[];
  listAllSkills(): Skill[];
  executeSkill(skillId: string, context: SkillContext): Promise<SkillResult>;
  validateSkill(skillId: string): ValidationResult;
}

export interface ArtifactService {
  saveArtifact(sessionId: string, artifact: Artifact): Promise<string>;
  getArtifact(artifactId: string): Artifact | null;
  listSessionArtifacts(sessionId: string): Artifact[];
  deleteArtifact(artifactId: string): boolean;
  updateArtifact(artifactId: string, artifact: Artifact): boolean;
  createSessionStorage(sessionId: string): Promise<void>;
  deleteSessionStorage(sessionId: string): Promise<void>;
}

export interface RouterService {
  routeAPI(request: APIRequest, providerId?: string): Promise<APIResponse>;
  routeMessage(message: Message, context: RoutingContext): RoutingResult;
  switchProvider(providerId: string): boolean;
  getActiveProvider(): ModelProvider;
  getFallbackChain(): string[];
  selectProviderForModel(modelId: string): ModelProvider;
}

export interface RoutingContext {
  session: Session;
  agent: Agent;
  skills: Skill[];
  artifacts: Artifact[];
}

export interface RoutingResult {
  destination: 'skill' | 'model';
  targetId: string;
  providerId?: string;
  confidence: number;
  reasoning: string;
}

export interface APIRequest {
  modelId: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface APIResponse {
  id: string;
  modelId: string;
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
}

export interface UserService {
  getUser(userId: string): User | null;
  updateUser(userId: string, user: User): void;
  getPreferences(userId: string): UserPreferences;
  createUser(user: User): User;
  deleteUser(userId: string): boolean;
}

export interface PromptBuilder {
  buildPrompt(context: PromptBuildContext): CompiledPrompt;
  mergeConstraints(layers: ConstraintLayer[]): ConstraintSet;
  resolveConflicts(constraints: ConstraintSet): ResolvedConstraint;
  applyBoundaries(skillInstructions: string, boundaries: Boundary[]): string;
}

export interface PromptBuildContext {
  system: SystemConfig;
  agent: Agent;
  skills: Skill[];
  session: Session;
  activeSkillId?: string;
}

export interface CompiledPrompt {
  system: string;
  agent: string;
  skill?: string;
  session: string;
  constraints: string[];
  modelConfig: ModelDefaults;
}

export interface ConstraintLayer {
  level: 'system' | 'agent' | 'skill' | 'session';
  constraints: string[];
  priority: number;
}

export interface ConstraintSet {
  all: string[];
  byLevel: Record<string, string[]>;
  conflicts: ConflictPair[];
}

export interface ConflictPair {
  constraintA: string;
  constraintB: string;
  levelA: string;
  levelB: string;
}

export interface ResolvedConstraint {
  effective: string[];
  blocked: string[];
  warnings: string[];
}
