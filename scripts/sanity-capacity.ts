import {writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

/** Read-only capacity check; use --fail-on-warning for a CI/preflight gate. */
async function main() {
  const {NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset,
    NEXT_PUBLIC_SANITY_API_VERSION: apiVersion} = process.env;
  if (!projectId || !dataset || !apiVersion) throw new Error('Sanity environment is incomplete');
  const client = getCliClient({apiVersion}).withConfig({projectId, dataset, useCdn: false});
  const stats = await client.request<{stale: boolean; fields: {count: {value: number; limit: number}}}>(
    {uri: `/data/stats/${encodeURIComponent(dataset)}`});
  if (stats.stale !== false) throw new Error('Statistics are stale; retry before making capacity decisions');
  const {value, limit} = stats.fields.count;
  if (!Number.isFinite(value) || value < 0 || !Number.isFinite(limit) || limit <= 0) {
    throw new Error('Attribute count or limit is unavailable');
  }
  const warningPercent = 80;
  const result = {projectId, dataset, checkedAt: new Date().toISOString(), attributes: value, limit,
    remaining: limit - value, usedPercent: Number((100 * value / limit).toFixed(2)),
    warningPercent, status: value >= limit ? 'limit' : value / limit >= warningPercent / 100 ? 'warning' : 'ok'};
  console.log(JSON.stringify(result, null, 2));
  const output = process.argv.find(arg => arg.startsWith('--output='))?.slice('--output='.length);
  if (output) writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  if (result.status === 'limit' || (process.argv.includes('--fail-on-warning') && result.status === 'warning')) {
    process.exitCode = 1;
  }
}

main().catch(error => {console.error(error.message); process.exitCode = 1;});
