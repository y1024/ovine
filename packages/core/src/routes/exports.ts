/**
 * 路由相关工具函数
 * 所有异步加载文件
 * TODO: 添加 unit test
 */

import { app } from '@/app'
import { ReqMockSource } from '@/utils/request/types'
import { isSubStr, retryPromise } from '@/utils/tool'

import { PageFileOption, PagePreset } from './types'

// 计算 路由 path
export function getRoutePath(path: string, origin: boolean = false) {
  const baseUrl = app.constants.baseUrl || '/'
  const currPthStr = currPath(path)
  const pathStr = `/${currPthStr}`
  const withBaseUrl = isSubStr(pathStr, baseUrl, 0)

  let routePath = `${withBaseUrl ? '/' : baseUrl}${currPthStr}`
  if (origin) {
    routePath = pathStr.replace(new RegExp(`^${baseUrl}`), '/')
  }

  return routePath
}

// 获取pages内组件文件在项目内的物理路径，用于 webpack 懒加载文件与打包
export function getPageFilePath(option: PageFileOption) {
  const { pathToComponent, path = '' } = option
  const componentPath = typeof pathToComponent === 'string' ? pathToComponent : path

  return currPath(componentPath)
}

// 获取 页面预设值。默认为  pages/xxx/preset.ts 该文件是权限设置必须文件
export function getPagePreset(option: PageFileOption): PagePreset | undefined {
  const filePath = getPageFilePath(option)

  try {
    const pagePest = require(`~/pages/${filePath}/preset`)
    /* webpackInclude: /pages[\\/].*[\\/]preset\.[t|j]sx?$/ */
    return pagePest.default
  } catch (e) {
    //
  }

  return undefined
}

// 获取 mock。默认为  pages/xxx/mock.ts 存在该文件，将自动注入mock到prest每一个 api
export function getPageMockSource(option: PageFileOption): ReqMockSource | undefined {
  const filePath = getPageFilePath(option)

  if (!app.env.isMock) {
    return undefined
  }

  try {
    const pagePest = require(`~/pages/${filePath}/mock`)
    /* webpackInclude: /pages[\\/].*[\\/]mock\.[t|j]sx?$/ */
    return pagePest.default
  } catch (e) {
    //
  }

  return undefined
}

// 异步获取页面文件
export async function getPageFileAsync(option: PageFileOption) {
  const filePath = getPageFilePath(option)

  return retryPromise(() =>
    import(
      `~/pages/${filePath}/index`
      /* webpackInclude: /[\\/]src[\\/]pages[\\/].*[\\/]index\.[t|j]sx?$/ */
      /* webpackChunkName: "p_[request]" */
    )
  )
}

// 获取 nodePath
export function getNodePath(option: PageFileOption) {
  const { nodePath } = option
  const filePath = getPageFilePath(option)

  return nodePath || filePath ? `/${filePath}` : ''
}

// 当前路径,去除多余前缀/,保持一致性  /login ==> login
export function currPath(path?: string, defaultPath: string = '') {
  if (!path) {
    return defaultPath
  }
  if (path === '/') {
    return defaultPath
  }
  return !isSubStr(path, '/', 0) ? path : path.substring(1)
}
