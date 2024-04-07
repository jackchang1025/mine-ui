import { request } from '@/utils/request.js'

/**
 * 投注日志规则表 API JS
 */

export default {

  /**
   * 获取投注日志规则表分页列表
   * @returns
   */
  group (params = {}) {
    return request({
      url: 'baccarat/bettingRuleLog/group',
      method: 'get',
      params
    })
  },

  /**
   * 获取投注日志规则表分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/bettingRuleLog/index',
      method: 'get',
      params
    })
  },

  /**
   * 读取投注日志规则表
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/bettingRuleLog/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将投注日志规则表删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/bettingRuleLog/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 更新投注日志规则表数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/bettingRuleLog/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 添加投注日志规则表
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/bettingRuleLog/save',
      method: 'post',
      data
    })
  },


}