import { forwardRef } from 'react'
import Modal from './Modal'
import type { Player } from '@/types/Player'
import PlayerIndicator from '../atoms/PlayerIndicator'

type Props = {
    winningPlayer?: Player,
    onClose: () => void
}

const WinningModal = forwardRef<HTMLDialogElement, Props>(({ winningPlayer, onClose }: Props, ref) => {
    const handleClose = () => {
        onClose()
    };
    return (
        <Modal ref={ref} onClose={handleClose}>
            {!!winningPlayer && <h3 className="font-bold text-2xl text-center flex items-center gap-2"><PlayerIndicator player={winningPlayer} /> won the game!!</h3>}
            <p>With ${winningPlayer?.money} and {winningPlayer?.propertiesOwned.length} properties owned👏👏👏</p>
        </Modal>
    )
})

export default WinningModal