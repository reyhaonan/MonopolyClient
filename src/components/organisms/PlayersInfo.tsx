import { useAuth } from '@/hooks/useAuth'
import type { Player } from '@/types/Player'
import classNames from 'classnames'
import Button from '../atoms/Button'
import Modal from '../molecules/Modal'
import { useRef } from 'react'
import XMarkIcon from '../atoms/icons/XMarkIcon'
import CheckIcon from '../atoms/icons/CheckIcon'

type Props = {
    players: Player[]
    currentPlayerIndex: number
    isPermittedToDeclareBankcruptcy: boolean
    onDeclareBankruptcy: () => void
}

const PlayersInfo = ({ players, currentPlayerIndex, isPermittedToDeclareBankcruptcy, onDeclareBankruptcy }: Props) => {
    const playerId = useAuth()

    const confirmDeclarationDialogRef = useRef<HTMLDialogElement>(null)

    return (
        <>
            <div className="list bg-base-100 rounded-box p-2">
                <div className="flex items-center justify-between">
                    <h2 className="p-2 pb-2 text-xs opacity-60 tracking-wide">Players</h2>
                    {isPermittedToDeclareBankcruptcy && <Button className='btn btn-error btn-square btn-sm btn-soft' onClick={() => confirmDeclarationDialogRef.current?.showModal()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                            <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clipRule="evenodd" />
                        </svg>
                    </Button>}
                </div>
                <div className="mt-2">
                    {players.map((player, i) =>
                        <div
                            className={classNames("list-row flex items-center px-2 py-1 flex-wrap border-2 transition-colors")}
                            key={player.id}
                            style={{
                                borderColor: currentPlayerIndex === i ? player.hexColor : "transparent"
                            }}
                        >

                            <div className="w-8 h-8 rounded-full" style={{
                                background: player.hexColor
                            }}></div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <span className='font-bold text-lg'>
                                        {player.name}
                                    </span>
                                    {playerId == player.id && <span className="badge badge-primary badge-xs">YOU</span>}
                                </div>
                                <div className="text-xs font-semibold opacity-40">
                                    Jail: {player.isInJail ? player.jailTurnsRemaining : "N"}
                                    {" | "}
                                    Doubles: {player.consecutiveDoubles}
                                    {" | "}
                                    ID: {player.id.substring(0, 6)}
                                </div>
                            </div>

                            <div className="ml-auto">${player.money}</div>
                        </div>
                    )}
                </div>
            </div>

            <Modal ref={confirmDeclarationDialogRef} onClose={() =>
                confirmDeclarationDialogRef.current?.close()
            }>

                <h3 className="font-bold text-lg">Are you sure you want to declare bankcruptcy?</h3>
                <div className="modal-action" >
                    <Button className='btn btn-error btn-soft w-20'
                        onClick={() => {
                            onDeclareBankruptcy()
                            confirmDeclarationDialogRef.current?.close()
                        }}
                    >
                        <CheckIcon />Yes
                    </Button>
                    <Button className='btn btn-primary w-20' onClick={() =>
                        confirmDeclarationDialogRef.current?.close()
                    }>
                        <XMarkIcon />No
                    </Button>
                </div>
            </Modal >
        </>
    )
}

export default PlayersInfo