export type TemplateAgentRequest = {
  templateId: string;
  description: string;
  templateTitle?: string;
};

export type TemplateAgentResponse = {
  templateId: string;
  reason: string;
  implementationPrompt: string;
  quickSteps: string[];
  customizations: string[];
};
