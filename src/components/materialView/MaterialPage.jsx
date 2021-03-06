import React from 'react'
import PlayerControls from './PlayerControls'
import Phrases from './Phrases'
import Waveform from '../Waveform'

import { connect } from 'react-redux'
import PlayerSlideShow from './PlayerSlideShow'
import { makeStyles } from '@material-ui/core/styles'
import wavesurferModule from '../../wavesurfer/wavesurfer'
import { setPlayerState } from '../../store/playerStateActions'
import MaterialTitle from './MaterialTitle'
import PrevNextButtons from './PrevNextButtons'
import clsx from 'clsx'
import ControlsPanel from '../materialForm/ControlsPanel'
import YoutubePlayer from '../YoutubePlayer'

const useStyles = makeStyles(theme => ({
  hidden: { display: 'none' },
  playerControlsPanel: { backgroundColor: 'white', zIndex: 2, position: 'sticky', top: 0 },
  slideshow: { marginBottom: 3 }
}))

function MaterialPage(props) {
  const classes = useStyles()
  const {
    currentPhraseId,
    dictationTimerId, // >0 then dictation is playing
    dictationDelay,
    dictationRepeats,
    setPlayerState,
    showSlideshow,
    showWaveform,
    phrases,
    youtubeId
  } = props

  const currentPhraseNum = phrases.findIndex(elem => elem.id === currentPhraseId)

  const play = () => {
    wavesurferModule.wavesurfer.play()
    stopDictation()
  }

  const pause = () => {
    wavesurferModule.wavesurfer.pause()
    stopDictation()
  }

  const playPhrase = id => event => {
    wavesurferModule.wavesurfer.regions.list[id].play()
    stopDictation()
  }

  const playPhraseDictation = id => event => {
    wavesurferModule.wavesurfer.regions.list[id].play()
  }

  const playNext = () => {
    const { id: nextId } = phrases[currentPhraseNum + 1]
    playPhrase(nextId)()
  }

  const playPrev = () => {
    const { id: prevId } = phrases[currentPhraseNum - 1]
    playPhrase(prevId)()
  }

  /**
   * repeats phrase N times with phraseLength X*delay
   * @param {Number} phraseNum
   * @param {Number} repeatCount
   * @param {Number} delayX - delaySeconds = delayX * phraseLength
   * @returns {array} repeats - array of setTimeout
   */
  const playPhraseNtimesWithXDelay = (currentRepeatNum, phraseNum, repeatCount, delayX) => {
    if (phraseNum === phrases.length) return
    const phrase = phrases[phraseNum]
    const { id, start, end } = phrase
    const phraseLength = end - start
    const delaySeconds = phraseLength * delayX

    playPhraseDictation(id)()

    const timerId = setTimeout(() => {
      if (currentRepeatNum < repeatCount) {
        playPhraseNtimesWithXDelay(currentRepeatNum + 1, phraseNum, repeatCount, delayX)
      } else {
        playPhraseNtimesWithXDelay(1, phraseNum + 1, repeatCount, delayX)
      }
    }, delaySeconds * 1000)

    setPlayerState(['dictationTimerId', timerId])
    setPlayerState(['dictationCurrentRepeat', currentRepeatNum])
  }

  const stopDictation = () => {
    clearTimeout(dictationTimerId)
    setPlayerState(['dictationTimerId', 0])
  }

  const playDictation = () => {
    const beginFrom = currentPhraseNum < 0 ? 0 : currentPhraseNum
    if (!dictationTimerId) {
      playPhraseNtimesWithXDelay(1, beginFrom, dictationRepeats, dictationDelay)
    } else {
      stopDictation()
    }
  }

  const playerControlsProps = {
    play,
    pause,
    playPhrase,
    playNext,
    playPrev,
    playDictation
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <MaterialTitle />
      {youtubeId && (
        <div>
          <YoutubePlayer videoId={youtubeId} />
        </div>
      )}
      <div className={showWaveform ? '' : classes.hidden}>
        <Waveform readOnly />
        <ControlsPanel />
      </div>
      <div className={clsx(classes.slideshow, { [classes.hidden]: !showSlideshow })}>
        <PlayerSlideShow currentPhraseNum={currentPhraseNum} />
      </div>
      <div className={classes.playerControlsPanel}>
        <PlayerControls {...playerControlsProps} />
      </div>
      <Phrases playPhrase={playPhrase} />
      <PrevNextButtons />
    </div>
  )
}

const mapStateToProps = state => {
  const { currentPhraseId, dictationCurrentRepeat, dictationTimerId } = state.playerState
  const { dictationRepeats, dictationDelay, showWaveform, showSlideshow } = state.playerSettings
  const { phrases, youtubeId } = state.pageContent
  return {
    currentPhraseId,
    dictationCurrentRepeat,
    dictationTimerId,
    dictationRepeats,
    dictationDelay,
    showWaveform,
    showSlideshow,
    phrases,
    youtubeId
  }
}

const mapDispatchToProps = dispatch => ({
  setPlayerState: payload => dispatch(setPlayerState(payload))
})

export default connect(mapStateToProps, mapDispatchToProps)(MaterialPage)
