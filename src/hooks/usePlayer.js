import { useState, useRef, useEffect } from 'react'
import bohemian from '../assets/img/Massa.jpg'
import renegade from '../assets/img/bek.jpg'
import blank from '../assets/img/33.jpg'
import runandhide from '../assets/img/loyy.jpg'
import munisa from '../assets/img/munisa.jpg'
import chumoli from '../assets/img/photo.jpg'
import ertasiyoqq from '../assets/img/ertasiyoq.jpg'
import Odamlarr from '../assets/img/odamlar.jpg'
import bohemianMusic from '../assets/music/Massa.mp3'
import renegadeMusic from '../assets/music/Bekk.mp3'
import blankMusic from '../assets/music/konsta.mp3'
import runandhideMusic from '../assets/music/loy.mp3'
import music from '../assets/music/Oylamading.mp3'
import konsta from '../assets/music/chumoli.mp3'
import ertasiyoq from '../assets/music/ertasi-yoq.mp3'
import Odamlar from '../assets/music/Odamlar nima deydi.mp3'

const dummyMusic = [
  { id: 'M-1111', albumImg: runandhide, name: 'LOY', artists: ['KONSTA & SHOKIR'], url: runandhideMusic, albumHexColor: '#B4B4B8' },
  { id: 'M-2222', albumImg: blank, name: 'Odamlar Ucha Olar !', artists: ['Konsta'], url: blankMusic, albumHexColor: '#cd4f00' },  
  { id: 'M-3333', albumImg: munisa, name: 'OYLAMADING', artists: ['MUNISA RIZAYEVA & KONSTA'], url: music , albumHexColor: '#D63484' },
  { id: 'M-4444', albumImg:chumoli, name: 'Chumoli', artists: ['KONSTA & SHOKIR'], url: konsta , albumHexColor: '#cd4f00' },
  { id: 'M-5555', albumImg:ertasiyoqq, name: 'Ertasi yoq', artists: ['KONSTA & SHOKIR'], url: ertasiyoq , albumHexColor: '#092635' },
  { id: 'M-6666', albumImg:Odamlarr, name: 'Odamlar Nima deydi ?', artists: ['KONSTA & Timur Alixonov'], url: Odamlar , albumHexColor: '#ADBC9F' },
  { id: 'M-7777', albumImg: bohemian, name: 'Qattu', artists: ['Massa & Mubinlolo'], url: bohemianMusic, albumHexColor: '#a83888' },
  { id: 'M-8888', albumImg: renegade, name: 'YOMON BOLA (REMIX)', artists: ['DJ TAB, MASSA, BEK.vines',], url: renegadeMusic, albumHexColor: '#3FC5F0' }
]

export const usePlayer = ({ initialMusicId }) => {
  const [musicId, setMusicId] = useState(initialMusicId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReplaying, setReplay] = useState(false)
  const [songDuration, setSongDuration] = useState(0)
  const [songTimeProgress, setSongTimeProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(new window.Audio(dummyMusic[musicId].url))
  const canPlayRef = useRef(false)
  const songChangedRef = useRef(false)
  const maxId = dummyMusic.length
  const music = dummyMusic[musicId]

  useEffect(() => {
    // song milliseconds progress for progress bar
    const updateSongProgress = () => {
      const newProgress = audioRef.current.currentTime * 1000
      setSongTimeProgress(newProgress)
    }

    audioRef.current.addEventListener('timeupdate', updateSongProgress)

    return () => {
      audioRef.current.removeEventListener('timeupdate', updateSongProgress)
    }
  }, [musicId])

  useEffect(() => {
    // auto replaying the song if isReplaying is active
    const autoReplay = () => {
      if (isReplaying) {
        audioRef.current.play()
        setSongTimeProgress(0)
      } else {
        playNextSong()
      }
    }
    audioRef.current.addEventListener('ended', autoReplay)

    return () => {
      audioRef.current.removeEventListener('ended', autoReplay)
    }
  }, [isReplaying, musicId])

  useEffect(() => {
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0.2
  }, [])

  // change application color when song changes
  useEffect(() => {
    const root = document.querySelector(':root')
    root.style.setProperty('--active-icon-color', dummyMusic[musicId].albumHexColor)
  }, [musicId])

  // see if the music after changed can be played
  useEffect(() => {
    canPlayRef.current = false

    const playSong = () => {
      canPlayRef.current = true

      if (songChangedRef.current) {
        playSongHandler()
        setIsPlaying(true)
        songChangedRef.current = false
      } else {
        setIsLoading(false)
      }
    }

    audioRef.current.addEventListener('canplaythrough', playSong)

    return () => {
      audioRef.current.removeEventListener('canplaythrough', playSong)
    }
  }, [musicId])

  useEffect(() => {
    // this is used to update the music duration in the screen
    const setNewSongDuration = () => {
      const newSongDuration = audioRef.current.duration * 1000
      setSongDuration(newSongDuration)
    }

    // set the song duration after metadata load
    audioRef.current.addEventListener('loadedmetadata', setNewSongDuration)

    return () => {
      audioRef.current.removeEventListener('loadedmetadata', setNewSongDuration)
    }
  }, [musicId])

  const playSongHandler = () => {
    setIsLoading(true)

    if (canPlayRef.current) {
      setIsLoading(false)
      audioRef.current.play()
      setIsPlaying(true)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const playNextSong = () => {
    setIsLoading(true)
    setIsPlaying(false)
    const newId = (musicId + 1) % maxId
    setMusicId(newId)
    songChangedRef.current = true
    audioRef.current.src = dummyMusic[newId].url
    setSongDuration(undefined)
    setSongTimeProgress(0)
  }

  const playPreviousSong = () => {
    setIsLoading(true)
    setIsPlaying(false)
    songChangedRef.current = true

    const newId = (musicId - 1 + maxId) % maxId
    audioRef.current.src = dummyMusic[newId].url
    setMusicId(newId)
    setSongDuration(undefined)
    setSongTimeProgress(0)
  }

  const replayHandler = () => {
    setReplay(!isReplaying)
  }

  const volumeHandler = (volume) => {
    audioRef.current.volume = (volume / 100)
  }

  const timeHandler = (timePorcentage) => {
    audioRef.current.muted = true
    const newTime = audioRef.current.duration * timePorcentage / 100
    audioRef.current.currentTime = newTime
  }

  const unmuteAudio = () => {
    audioRef.current.muted = false
  }

  return {
    music,
    isPlaying,
    isReplaying,
    songDuration,
    songTimeProgress,
    isLoading,
    unmuteAudio,
    volumeHandler,
    playNextSong,
    playPreviousSong,
    playSongHandler,
    replayHandler,
    timeHandler
  }
}
