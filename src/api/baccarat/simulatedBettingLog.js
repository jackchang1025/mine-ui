import { request } from '@/utils/request.js'

/**
 * 投注日志表 API JS
 */

export default {


  /**
   * 获取投注分页列表
   * @returns
   */
  chart (params = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/chart',
      method: 'get',
      params
    })
  },

  /**
   * 获取投注日志表分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加投注日志表
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新投注日志表数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取投注日志表
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/simulatedBettingLog/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将投注日志表删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/simulatedBettingLog/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改投注日志表数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/changeStatus',
      method: 'put',
      data
    })
  },

  /**
    * 投注日志表导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/import',
      method: 'post',
      data
    })
  },

  /**
   * 投注日志表下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/bettingLog/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 投注日志表导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/simulatedBettingLog/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}