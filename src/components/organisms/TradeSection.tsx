import type { Player, PlayerWithProperties } from '@/types/Player'
import type { Trade } from '@/types/Trade'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { useRef, useState } from 'react'
import type { BoardSpace, PropertySpace } from '@/types/BoardSpace'
import classNames from 'classnames'
import TradeModal from '../molecules/TradeModal'
import Modal from '../molecules/Modal'

type Props = {
    players: Player[]
    activeTrades: Trade[]
    spaces: BoardSpace[]
}

const TradeSection = ({ activeTrades, players, spaces }: Props) => {
    const playerId = useAuth()

    const propertyOnlySpace: PropertySpace[] = spaces.filter(sp => sp.$type != "special")

    const playersWithProperties = players.map(p => {
        return {
            ...p, propertiesOwned: p.propertiesOwned.map(property => {
                const foundProperty = propertyOnlySpace.find(sp => sp.id === property)
                if (!foundProperty) throw new Error(`What the hell is this property?: ${property}`)
                return foundProperty
            }
            )
        }
    })

    const player = playersWithProperties.find(p => p.id === playerId) || null

    const otherPlayers = playersWithProperties.filter(p => p.id !== playerId)

    const [initiator, setInitiator] = useState<PlayerWithProperties | null>(null)
    const [recipient, setRecipient] = useState<PlayerWithProperties | null>(null)

    const selectPlayerDialogRef = useRef<HTMLDialogElement>(null)
    const offerDialogRef = useRef<HTMLDialogElement>(null)



    return (
        <>
            <Modal ref={selectPlayerDialogRef} onClose={() =>
                selectPlayerDialogRef.current?.close()}>

                <h3 className="font-bold text-lg">Trade with...</h3>
                <div className="modal-action">
                    <ul className="menu rounded-box w-full">
                        {otherPlayers.map(p =>
                            <li key={p.id}>
                                <Button className='btn capitalize' onClick={() => {
                                    setInitiator(player)
                                    setRecipient(p)
                                    selectPlayerDialogRef.current?.close()
                                    offerDialogRef.current?.showModal()
                                }}>{p.name}</Button>
                            </li>)}
                    </ul>
                </div>
            </Modal >

            <TradeModal
                ref={offerDialogRef}
                initiator={initiator}
                recipient={recipient}
                onClose={() => {
                    offerDialogRef.current?.close()
                    setInitiator(null)
                    setRecipient(null)
                }}
                onOffer={(pr) => console.log("BREH", pr)}
            />


            <section className='bg-base-200 rounded-box p-2'>
                <div className="flex justify-between items-center">
                    <h2 className='text-lg font-semibold'>Trade</h2>
                    <Button className='btn btn-primary btn-sm' onClick={() => selectPlayerDialogRef.current?.showModal()}>+ Trade</Button>
                </div>
                <div className="trade-lists">
                    {activeTrades.map(trade =>
                        <div className="trade" key={trade.id}>
                            {trade.initiatorId} - {trade.approvalId}<br />
                            {trade.moneyFromInitiator} for {trade.moneyFromRecipient}<br />
                            <div className="flex">
                                <div className="flex-1">
                                    <ol className='list-disc'>
                                        {trade.propertyOffer.map(p =>
                                            <li key={p}>{p}</li>
                                        )}
                                    </ol>
                                </div>
                                <div className="flex-1">
                                    <ol className='list-disc'>
                                        {trade.propertyCounterOffer.map(p =>
                                            <li key={p}>{p}</li>
                                        )}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default TradeSection