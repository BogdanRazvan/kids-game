import { useState } from 'react'
import { Home } from './components/Home'
import { Collection } from './components/Collection'
import { Colors } from './games/Colors'
import { Counting } from './games/Counting'
import { Shapes } from './games/Shapes'
import { Animals } from './games/Animals'
import { Memory } from './games/Memory'
import { Shadows } from './games/Shadows'
import { Sizes } from './games/Sizes'
import { Different } from './games/Different'
import { Patterns } from './games/Patterns'
import { Same } from './games/Same'
import { Letters } from './games/Letters'
import { Digits } from './games/Digits'
import { MoreLess } from './games/MoreLess'
import { Odd } from './games/Odd'
import { Music } from './games/Music'
import { SpotDifference } from './games/SpotDifference'
import { Puzzle } from './games/Puzzle'

export type GameId =
  | 'colors'
  | 'counting'
  | 'shapes'
  | 'animals'
  | 'memory'
  | 'shadows'
  | 'sizes'
  | 'different'
  | 'patterns'
  | 'same'
  | 'letters'
  | 'digits'
  | 'moreless'
  | 'odd'
  | 'music'
  | 'spot'
  | 'puzzle'
type Screen = 'home' | 'collection' | GameId

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const back = () => setScreen('home')

  return (
    <div className="app">
      {screen === 'home' && (
        <Home onPick={setScreen} onOpenBook={() => setScreen('collection')} />
      )}
      {screen === 'collection' && <Collection onBack={back} />}
      {screen === 'colors' && <Colors onBack={back} />}
      {screen === 'counting' && <Counting onBack={back} />}
      {screen === 'shapes' && <Shapes onBack={back} />}
      {screen === 'animals' && <Animals onBack={back} />}
      {screen === 'memory' && <Memory onBack={back} />}
      {screen === 'shadows' && <Shadows onBack={back} />}
      {screen === 'sizes' && <Sizes onBack={back} />}
      {screen === 'different' && <Different onBack={back} />}
      {screen === 'patterns' && <Patterns onBack={back} />}
      {screen === 'same' && <Same onBack={back} />}
      {screen === 'letters' && <Letters onBack={back} />}
      {screen === 'digits' && <Digits onBack={back} />}
      {screen === 'moreless' && <MoreLess onBack={back} />}
      {screen === 'odd' && <Odd onBack={back} />}
      {screen === 'music' && <Music onBack={back} />}
      {screen === 'spot' && <SpotDifference onBack={back} />}
      {screen === 'puzzle' && <Puzzle onBack={back} />}
    </div>
  )
}
