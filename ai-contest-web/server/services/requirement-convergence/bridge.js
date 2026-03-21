/**
 * requirement-convergence 桥接模块
 * 使用 tsx 运行 TypeScript 核心分析功能
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedAnalysis = null;
let lastAnalysisTime = 0;
const CACHE_TTL = 60000;

function escapeForShell(str) {
  return str.replace(/'/g, "'\\''");
}

export async function analyzeWithTsx(requirement, sessionId = 'default') {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, 'src', 'insight-engine', 'insight-engine.ts');

    const args = [
      '--eval',
      `
      import { analyzeRequirement } from '${scriptPath.replace(/\\/g, '\\\\')}';
      const requirement = ${JSON.stringify(requirement)};
      analyzeRequirement(requirement).then(result => {
        console.log('__ANALYSIS_RESULT__' + JSON.stringify(result) + '__ANALYSIS_END__');
      }).catch(err => {
        console.error('Analysis error:', err.message);
        process.exit(1);
      });
      `
    ];

    const proc = spawn('npx', ['tsx', ...args], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('tsx error:', stderr);
        reject(new Error(`Analysis failed: ${stderr}`));
        return;
      }

      const match = stdout.match(/__ANALYSIS_RESULT__(.*)__ANALYSIS_END__/);
      if (match) {
        try {
          const result = JSON.parse(match[1]);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse result: ${e.message}`));
        }
      } else {
        reject(new Error('No result found in output'));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

export async function analyze(requirement, context = {}) {
  const now = Date.now();

  if (cachedAnalysis && (now - lastAnalysisTime) < CACHE_TTL) {
    console.log('📦 [缓存] 使用缓存的分析结果');
    return cachedAnalysis;
  }

  try {
    console.log('🔧 [桥接] 使用 TypeScript 引擎分析需求...');
    const result = await analyzeWithTsx(requirement, context.sessionId);

    cachedAnalysis = result;
    lastAnalysisTime = now;

    return result;
  } catch (error) {
    console.error('⚠️  TypeScript 引擎调用失败:', error.message);
    console.log('📦 [降级] 使用内置简化分析');
    return null;
  }
}

export function clearCache() {
  cachedAnalysis = null;
  lastAnalysisTime = 0;
}

export default { analyze, clearCache };
