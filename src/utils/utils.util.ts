/**
 * 该文件定义一些常用的工具类或函数
 */

import { createHash } from 'crypto';

export function encryptPass(password: string): string {
  const firstMd5 = createHash('md5').update(password).digest('hex');
  const salt = Buffer.from(firstMd5).toString('base64') + '576hbgh6';
  return createHash('md5').update(salt).digest('hex');
}
