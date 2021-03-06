import Vuex from 'vuex'
import {auth, DB, GoogleProvider, TwitterProvider} from '~/plugins/firebase'

const language = (window.navigator.languages && window.navigator.languages[0]) ||
window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage

const createStore = () => {
  return new Vuex.Store({
    state: {
      sidebar: false,
      locales: ['en', 'jp'],
      locale: (language === 'ja') ? 'jp' : 'en',
      user: null,
      profile: {
        name: '',
        email: '',
        fg_exp: null,
        region: null,
        introduction: ''
      },
      createRoom: {
        roomCondition: 'NOT_CREATED',
        title: null,
        title_exp: null,
        targetLevel: null,
        entry: [],
        entry_exp: null,
        allowChangeEntry: false,
        startDatetime: null,
        duration: 0,
        rivalEntryMust: [],
        rivalEntryExclusion: [],
        rivalFg_expMin: null,
        rivalFg_expMax: null,
        rivalTitle_expMin: null,
        rivalTitle_expMax: null,
        rivalEntry_expMin: null,
        rivalEntry_expMax: null,
        rivalTargetLevelMin: null,
        rivalTargetLevelMax: null,
        notes: ''
      }
    },
    getters: {
      activeUser: (state, getters) => {
        return state.user
      },
      activeProfile: (state, getters) => {
        return state.profile
      }
    },
    actions: {
      autoSignIn ({commit}, payload) {
        commit('setUser', payload)
      },
      signInWithTwitter ({commit}) {
        return new Promise((resolve, reject) => {
          auth.signInWithRedirect(TwitterProvider)
          resolve()
        })
      },
      signInWithGoogle ({commit}) {
        return new Promise((resolve, reject) => {
          auth.signInWithRedirect(GoogleProvider)
          resolve()
        })
      },
      signOut ({commit}) {
        return auth.signOut().then(() => {
          commit('setUser', null)
        }).catch(err => console.log(err))
      },
      changeLang ({commit}, payload) {
        commit('SET_LANG', payload)
      },
      loadProfile ({commit}) {
        if (!this.state.user) {
          return
        }
        return DB.collection('users').doc(this.state.user.uid).get().then((querySnapshot) => {
          if (querySnapshot.exists) {
            commit('setProfile', {
              name: querySnapshot.data()['name'],
              email: querySnapshot.data()['email'],
              fg_exp: querySnapshot.data()['fg_exp'],
              region: querySnapshot.data()['region'],
              introduction: querySnapshot.data()['introduction']
            })
          } else {
            // 初めての人はログイン先から情報を持ってくる
            commit('setProfile', {
              name: this.state.user.displayName,
              email: this.state.user.email,
              fg_exp: null,
              region: null,
              introduction: ''
            })
          }
        })
      }
    },
    mutations: {
      toggleSidebar (state) {
        state.sidebar = !state.sidebar
      },
      SET_LANG (state, locale) {
        console.log('SET_LANG')
        console.log(locale)
        if (state.locales.indexOf(locale) !== -1) {
          state.locale = locale
        }
      },
      setUser (state, payload) {
        state.user = payload
        if (!state.user) {
          state.profile = {
            name: '',
            email: '',
            fg_exp: null,
            region: null,
            introduction: ''
          }
        }
      },
      setProfile (state, payload) {
        state.profile.name = payload.name
        state.profile.email = payload.email
        state.profile.fg_exp = payload.fg_exp
        state.profile.region = payload.region
        state.profile.introduction = payload.introduction
      },
      changeRoomcondition (state, payload) {
        state.createRoom.roomCondition = 'NOT_CREATED'
      },
      setRoom (state, payload) {
        state.createRoom.title = payload.title
        state.createRoom.title_exp = payload.title_exp
        state.createRoom.targetLevel = payload.targetLevel
        state.createRoom.entry = payload.entry
        state.createRoom.entry_exp = payload.entry_exp
        state.createRoom.allowChangeEntry = payload.allowChangeEntry
        state.createRoom.startDatetime = payload.startDatetime
        state.createRoom.duration = payload.duration
        state.createRoom.rivalEntryMust = payload.rivalEntryMust
        state.createRoom.rivalEntryExclusion = payload.rivalEntryExclusion
        state.createRoom.rivalFg_expMin = payload.rivalFg_expMin
        state.createRoom.rivalFg_expMax = payload.rivalFg_expMax
        state.createRoom.rivalTitle_expMin = payload.rivalTitle_expMin
        state.createRoom.rivalTitle_expMax = payload.rivalTitle_expMax
        state.createRoom.rivalEntry_expMin = payload.rivalEntry_expMin
        state.createRoom.rivalEntry_expMax = payload.rivalEntry_expMax
        state.createRoom.rivalTargetLevelMin = payload.rivalTargetLevelMin
        state.createRoom.rivalTargetLevelMax = payload.rivalTargetLevelMax
        state.createRoom.notes = payload.notes
      }
    }
  })
}
export default createStore
