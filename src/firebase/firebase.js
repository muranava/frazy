import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
//npmimport 'firebase/auth'
import firebaseConfig from '../config/firebaseConfig'

firebase.initializeApp(firebaseConfig)

firebase.firestore()
firebase.storage()

export default firebase
