// GitHub API Service
// All secrets loaded from environment variables

const GITHUB_TOKEN = process.env.GITHUB_TOKEN_CF || '';
const GITHUB_USER = process.env.GITHUB_USERNAME || 'segz7448';
const GH_BASE = 'https://api.github.com';

const ghHeaders = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
};

export const listRepos = async (): Promise<any[]> => {
  const res = await fetch(`${GH_BASE}/user/repos?per_page=100&sort=updated`, {
    headers: ghHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch repos');
  return res.json();
};

export const getBranches = async (repo: string): Promise<string[]> => {
  const res = await fetch(`${GH_BASE}/repos/${repo}/branches`, {headers: ghHeaders});
  if (!res.ok) return ['main'];
  const data = await res.json();
  return data.map((b: any) => b.name);
};

export const getLatestCommit = async (
  repo: string,
  branch: string = 'main',
): Promise<{sha: string; message: string; author: string}> => {
  const res = await fetch(`${GH_BASE}/repos/${repo}/commits/${branch}`, {
    headers: ghHeaders,
  });
  if (!res.ok) throw new Error('Failed to fetch commit');
  const data = await res.json();
  return {
    sha: data.sha?.slice(0, 7) || '',
    message: data.commit?.message || '',
    author: data.commit?.author?.name || '',
  };
};

export const triggerWorkflow = async (
  repo: string,
  workflowFile: string = 'build.yml',
  branch: string = 'main',
): Promise<void> => {
  const res = await fetch(
    `${GH_BASE}/repos/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ref: branch}),
    },
  );
  if (!res.ok && res.status !== 204) throw new Error('Failed to trigger workflow');
};

export const getWorkflowRuns = async (repo: string): Promise<any[]> => {
  const res = await fetch(`${GH_BASE}/repos/${repo}/actions/runs?per_page=10`, {
    headers: ghHeaders,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.workflow_runs || [];
};

export const getFile = async (
  repo: string,
  path: string,
  branch: string = 'main',
): Promise<string | null> => {
  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/${branch}/${path}`,
    {headers: {'Authorization': `token ${GITHUB_TOKEN}`}},
  );
  if (!res.ok) return null;
  return res.text();
};

export const GITHUB_USERNAME = GITHUB_USER;
