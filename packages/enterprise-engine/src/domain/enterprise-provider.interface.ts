export interface ISsoProvider {
  readonly provider: string;
  authorize(config: { redirectUri: string; state: string; scopes?: string[] }): Promise<{ url: string }>;
  callback(config: { code: string; redirectUri: string }): Promise<{ accessToken: string; idToken?: string; profile: { id: string; email: string; name?: string; avatar?: string } }>;
  validateToken(token: string): Promise<{ valid: boolean; profile?: { id: string; email: string } }>;
}

export interface IComplianceChecker {
  readonly type: string;
  check(settings: Record<string, unknown>): Promise<{ passed: boolean; findings: Array<{ severity: string; message: string; control: string }>; score: number }>;
}
