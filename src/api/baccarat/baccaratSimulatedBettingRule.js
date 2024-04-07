import { request } from '@/utils/request.js'

/**
 * 投注规则 API JS
 */

export default {

  /**
   * 获取投注规则分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加投注规则
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新投注规则数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取投注规则
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/simulatedBettingRule/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将投注规则删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/simulatedBettingRule/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改投注规则数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/changeStatus',
      method: 'put',
      data
    })
  },

  /**
    * 投注规则导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/import',
      method: 'post',
      data
    })
  },

  /**
   * 投注规则下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/simulatedBettingRule/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 投注规则导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/simulatedBettingRule/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}