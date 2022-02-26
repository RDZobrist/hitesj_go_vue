<!--
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
-->
<template>
  <b-container fluid class="main-container">
    <!-- Header -->
    <b-row class="fixed-header">
      <b-col>
        <auth ref="auth" :passkey="resetkey"></auth>
        <b-navbar class="app-header">
          <b-navbar-brand href="https://braries.com" class="d-none d-md-block pr-5">
            <b-img class="braries-logo" src="~@/assets/braries-logo.png" />
          </b-navbar-brand>

          <!-- Search & History -->
          <header-search />

          <!-- Settings Nav -->
          <header-settings @login="showLogin" />
        </b-navbar>
      </b-col>
      <hr class="w-100 m-0" />
    </b-row>

    <b-row>
      <!-- Side Nav -->
      <b-col v-if="isAuthenticated" class="flex-grow-0 d-none d-md-block fixed-sidebar">
        <b-row>
          <b-col>
            <b-row>
              <b-col>
                <nav-basic @team-selected="gotoTeam" />
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <storage-info class=""/>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <header-search-history class="d-none d-md-block"/>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>

      <b-col v-if="isAuthenticated" class="overflow-auto content-viewer">
        <!-- Sub Header -->
        <b-row class="d-md-flex my-0 my-md-4">
          <b-col>
            <team-select
              class="teamselect d-none d-md-block"
              @team-selected="gotoTeam"
            />
          </b-col>
          <file-actions
            class="pr-4"
            v-if="fetchSelectedFilesInTable.length > 0"
            :checkedFiles="fetchSelectedFilesInTable"
          />
        </b-row>

        <b-row class="d-flex d-md-none">
          <b-col>
            <nav-basic @team-selected="gotoTeam" />
          </b-col>
        </b-row>

        <b-row class="mb-4 overflow-hidden">
          <!-- Main Content -->
          <b-col>
            <router-view />
          </b-col>

          <!-- Side View -->
          <router-view name="sideview" />
        </b-row>
      </b-col>

      <b-col v-else-if="loading" class="empty">
        <h1>Braries is Loading.</h1>
        <h1>Please Wait...</h1>
        <b-spinner style="width: 3em; height: 3em" />
      </b-col>

      <b-col v-else class="empty">
        <h2>Welcome!</h2>
        <h2>Please login to continue.</h2>
        <b-button size="lg" variant="outline-secondary" class="shadow-md" @click="showAuth">
          Login
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// Header
import HeaderSearch from '@/components/header-search'
import HeaderSettings from '@/components/header-settings'

// Sub Header
import TeamSelect from '@/components/team-select'
import { mapGetters, mapActions } from 'vuex'
import { GET_USER, LOAD_SERVER, ERROR_LOOP } from '@/store/actions.type'

// Side Nav
import NavBasic from '@/components/nav-basic'
import StorageInfo from '@/components/storage-info'
import HeaderSearchHistory from '@/components/header-search-history'

import Auth from '@/components/auth'

import FileActions from '@/components/file-actions'

export default {
  name: 'App',
  data () {
    return {
      appInfoDisplay: null,
      context: 'My Cloud',
      auth: false
    }
  },
  created () {
    this.$store
      .dispatch(GET_USER)
      .then(() => {
        this.$store.dispatch(LOAD_SERVER)
      })
      .catch(() => {
        this.showAuth()
      })
  },
  methods: {
    showAuth () {
      if (this.$route.name === 'reset') {
        this.$refs.auth.openReset()
      } else {
        this.$refs.auth.openLogin()
      }
    },
    // Used by ErrorControl to display specific errors: login, ...
    makeToast (msg, title = 'Error', appendToast = false) {
      this.$bvToast.toast(msg, {
        title,
        noAutoHide: !!process.env.VUE_APP_DEBUG,
        autoHideDelay: 5000,
        appendToast
      })
    },

    gotoTeam (id) {
      if (id === this.currentUser.id) {
        this.$router.push({ name: 'home' })
      } else {
        this.$router.push(`/team/${id}`)
      }
    },

    showLogin () {
      this.$refs.auth.openLogin()
    },
    ...mapActions({
      handleErrors: ERROR_LOOP
    })
  },

  computed: {
    resetkey () {
      return this.$route.params ? this.$route.params.passkey || '' : ''
    },
    ...mapGetters([
      'isAuthenticated',
      'loading',
      'currentUser',
      'availableErrors',
      'fetchSelectedFilesInTable'
    ])
  },
  watch: {
    availableErrors (newErrors) {
      if (newErrors) {
        this.handleErrors(e => {
          if (e.response) {
            switch (e.response.status) {
              case 401:
                if (this.isAuthenticated) {
                  this.makeToast('Please relogin', 'Login Required')
                }
                this.showAuth()
                break
              case 403:
                this.makeToast('You do not have permission to perform that action', 'Permission Denied')
                break
              case 409:
                break
              case 460:
                this.makeToast('File is too large', 'Large File')
                break
              case 461:
                this.makeToast('Maximum file count reached, Delete files and empty trash to reclaim space', 'File Limit')
                break
              case 462:
                this.makeToast('File exceeded available space, Delete files and empty trash to reclaim space', 'File Limit')
                break
              default:
                this.makeToast(e.message, e.name || 'Error')
            }
          } else {
            this.makeToast(e.message, e.name || 'Error')
          }
        })
      }
    }
  },

  components: {
    // Header
    HeaderSearch,
    HeaderSettings,

    // Sub Header
    TeamSelect,

    // Side Nav
    NavBasic,
    StorageInfo,
    HeaderSearchHistory,

    Auth,
    FileActions
  }
}
</script>

<style lang="scss">
/* TODO: Is this the correct place to style the BODY...background-color is being
overridden by something after this point. */

#app {
  hr {
    border-top: 1px solid rgba(0, 0, 0, 0.4);
  }
}

.main-container {
  margin-top: 172px;
  .fixed-header {
    position: fixed;
    top: 0;
    z-index: 1;
    background: #E5F7FF;
    width: 100%
  }
  .fixed-sidebar {
    position: fixed;
    top: 172px;
    z-index: 1;
    width: 100%;
    max-width: 190px;
  }
  .content-viewer {
    margin-left: 180px
  }
  @media only screen and (max-width: 768px) {
    .content-viewer {
      margin-left: 0px;
    }
    .main-container {
      margin-top: 80px;
    }
  }
}
@media only screen and (max-width: 768px) {
  .main-container {
    margin-top: 80px;
  }
}

/* Sub Nav */
.teamselect {
  max-width: 12em;
}
.empty {
  text-align: center;
  margin-top: 30px;
  button {
    margin-top: 7%;
    background-color: white;
    border-radius: 4px;
    border: 1px solid rgb(202, 202, 202);
    padding: 14px 38px;
    color: rgb(46, 46, 46);
  }

  button:hover {
    background-color: rgb(168, 196, 255);
    color: rgb(46, 46, 46);
  }
}
</style>
