export class ExecuteActionDto {
  installationId!: string;
  actionId!: string;
  input!: Record<string, unknown>;
  projectId!: string;
}
