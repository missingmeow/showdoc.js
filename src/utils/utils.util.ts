/**
 * 该文件定义一些常用的工具类或函数
 */

import { createHash } from 'crypto';

/**
 * 明文密码哈希加密，返回加密后的字符串
 * @param password 密码
 */
export function encryptPass(password: string): string {
  const firstMd5 = createHash('md5').update(password).digest('hex');
  const salt = Buffer.from(firstMd5).toString('base64') + '576hbgh6';
  return createHash('md5').update(salt).digest('hex');
}

/**
 * 返回当前的时间戳，精确到 秒
 */
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 把时间戳转换成字符串，格式为 yyyy-MM-dd HH:mm:ss
 * @param timestamp 时间戳，单位 秒
 */
export function timeString(timestamp: number): string {
  function n2s(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  const t = new Date(timestamp * 1000);
  return `${t.getFullYear()}-${n2s(t.getMonth() + 1)}-${n2s(t.getDay())} ${n2s(t.getHours())}:${n2s(
    t.getMinutes(),
  )}:${n2s(t.getSeconds())}`;
}
