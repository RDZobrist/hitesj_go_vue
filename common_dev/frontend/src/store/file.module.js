// Copyright August 2020 Maxset Worldwide Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import FileService from '@/service/file'
import PermissionService from '@/service/permission'
import {
  LOAD_SERVER,
  CREATE_FILE,
  DELETE_FILES,
  GET_FILE,
  CREATE_WEB_FILE
} from './actions.type'
import {
  FILE_LOADING,
  SET_FILE,
  PROCESS_SERVER_STATE,
  PUSH_ERROR,
  SET_ACTIVE_FILES,
  SET_SELECTED_FILES
} from './mutations.type'

const state = {
  loading: 0,
  fileSet: {},
  user: {
    owned: [],
    shared: []
  },
  groups: {},
  public: [],
  active: [],
  selectedFilesOnTable: []
}

const actions = {
  async [GET_FILE] ({ commit, state }, payload) {
    if (!state.fileSet[payload.id] || payload.from === 'fileViewer') {
      commit(FILE_LOADING, 1)
      try {
        let file = await FileService.info({ fid: payload.id }).then(res => {
          return {
            size: res.data.size || 0,
            count: res.data.count || 0,
            ...res.data.file
          }
        })
        commit(SET_FILE, file)
      } catch (err) {
        commit(PUSH_ERROR, err.addDebug('action GET_FILE'))
      } finally {
        commit(FILE_LOADING, -1)
      }
    }
    return state.fileSet[payload.id]
  },
  [CREATE_FILE] (context, params) {
    context.commit(FILE_LOADING, 1)
    return FileService.create(params)
      .then(async res => {
        if (context.getters.activeGroup) {
          await PermissionService.share({
            id: res.data.id,
            targets: context.getters.activeGroup.id
          })
        }
        return res.data
      })
      .catch(err => context.commit(PUSH_ERROR, err.addDebug('action CREATE_FILE')))
      .finally(() => context.dispatch(LOAD_SERVER))
      .finally(() => {
        context.commit(FILE_LOADING, -1)
      })
  },
  [CREATE_WEB_FILE] ({ commit, dispatch }, { url, group, folder }) {
    commit(FILE_LOADING, 1)
    return FileService.webpage({ url, group, folder })
      .then(res => res.data)
      .catch(err => commit(PUSH_ERROR, err.addDebug('action CREATE_WEB_FILE')))
      .finally(() => dispatch(LOAD_SERVER))
      .finally(() => commit(FILE_LOADING, -1))
  },
  [DELETE_FILES] ({ commit, dispatch }, { ids }) {
    commit(FILE_LOADING, 1)
    return Promise.allSettled(
      (ids || []).map(
        id => FileService.erase({ fid: id }).catch(err => { commit(PUSH_ERROR, err.addDebug('action DELETE_FILES')); return err })
      )
    )
      .finally(() => {
        dispatch(LOAD_SERVER)
      })
      .finally(() => {
        commit(FILE_LOADING, -1)
      })
  }
}

const mutations = {
  [FILE_LOADING] (state, d) {
    state.loading += d
  },
  [SET_FILE] (state, file) {
    state.fileSet[file.id] = file
  },
  [PROCESS_SERVER_STATE] (state, server) {
    state.fileSet = server.files
    state.public = server.public
    state.user.owned = server.user.files.own || []
    state.user.shared = server.user.files.view || []
    state.groups = {}
    for (let key in server.groups) {
      state.groups[key] = {
        owned: server.groups[key].files.own || [],
        shared: server.groups[key].files.view || []
      }
    }
  },
  [SET_ACTIVE_FILES] (state, files) {
    state.active = files
  },
  [SET_SELECTED_FILES] (state, files) {
    state.selectedFilesOnTable = files
  }
}

const getters = {
  fileLoading (state) {
    return state.loading > 0
  },
  populateFiles (state) {
    return function (id) {
      if (typeof id === 'string') {
        return state.fileSet[id]
      }
      if (id instanceof Array) {
        return id.map(i => {
          return state.fileSet[i]
        })
      }
      throw new Error('unrecognized file id type')
    }
  },
  fetchSelectedFilesInTable (state, getters) {
    if (state.selectedFilesOnTable.length === 0) return []
    return getters.populateFiles(state.selectedFilesOnTable)
  },
  ownedFiles (state, getters) {
    if (!getters.activeGroup) {
      return state.user.owned
    } else {
      return state.groups[getters.activeGroup.id].owned
    }
  },
  sharedFiles (state, getters) {
    if (!getters.activeGroup) {
      return state.user.shared
    } else {
      return state.groups[getters.activeGroup.id].shared
    }
  },
  activeFiles (state) {
    return state.active
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
