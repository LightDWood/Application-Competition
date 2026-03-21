import configService from './ConfigService.js';
import agentService from './AgentService.js';
import sessionService from './SessionService.js';
import skillService from './SkillService.js';
import artifactService from './ArtifactService.js';
import routerService from './RouterService.js';
import userService from './UserService.js';
import promptBuilder from './PromptBuilder.js';

export {
  configService,
  agentService,
  sessionService,
  skillService,
  artifactService,
  routerService,
  userService,
  promptBuilder
};

export const services = {
  config: configService,
  agent: agentService,
  session: sessionService,
  skill: skillService,
  artifact: artifactService,
  router: routerService,
  user: userService,
  prompt: promptBuilder
};

export default services;