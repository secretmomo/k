import { execSync } from 'child_process';

interface MacHardwareInfo {
  modelName: string | null; // MacBook Air / MacBook Pro / Mac mini
  modelIdentifier: string | null; // MacBookAir10,1
  chip: string | null; // Apple M1 / M2 / Intel
  raw: string; // 原始输出（调试用）
}

/**
 * 获取 macOS 硬件信息（基于 system_profiler）
 */
function getMacHardwareInfo(): MacHardwareInfo {
  try {
    const output = execSync('system_profiler SPHardwareDataType', {
      encoding: 'utf-8',
    });

    const getValue = (key: string) => {
      const regex = new RegExp(`${key}:\\s+(.+)`);
      const match = output.match(regex);
      return match?.[1]?.trim() ?? null;
    };

    return {
      modelName: getValue('Model Name'),
      modelIdentifier: getValue('Model Identifier'),
      chip: getValue('Chip') || getValue('Processor Name'), // 兼容 Intel
      raw: output,
    };
  } catch (_e: unknown) {
    return {
      modelName: null,
      modelIdentifier: null,
      chip: null,
      raw: '',
    };
  }
}

export const macHardwareInfo = getMacHardwareInfo();
