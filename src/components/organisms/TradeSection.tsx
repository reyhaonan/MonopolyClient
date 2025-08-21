import type { Player, PlayerWithProperties } from '@/types/Player'
import type { Trade, TradeOffer } from '@/types/Trade'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { useRef, useState, type ComponentProps } from 'react'
import type { BoardSpace, PropertySpace } from '@/types/BoardSpace'
import TradeModal from '../molecules/TradeModal'
import Modal from '../molecules/Modal'

type Props = {
    players: Player[]
    activeTrades: Trade[]
    spaces: BoardSpace[]
} & Pick<ComponentProps<typeof TradeModal>, "onInitiateTrade" | "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade">

const TradeSection = ({ activeTrades, players, spaces, onInitiateTrade, onNegotiateTrade, ...tradeModalProps }: Props) => {
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
                initiator={player}
                recipient={recipient}
                onClose={() => {
                    offerDialogRef.current?.close()
                }}
                onInitiateTrade={onInitiateTrade}
                tradeToInspect={null}
            />


            <section className='bg-base-200 rounded-box p-2'>
                <div className="flex justify-between items-center">
                    <h2 className='text-lg font-semibold'>Trade</h2>
                    <Button className='btn btn-primary btn-sm' onClick={() => selectPlayerDialogRef.current?.showModal()}>+ Trade</Button>
                </div>
                <div className="trade-lists flex flex-col">
                    {activeTrades.map(trade =>
                        <TradeItem
                            key={trade.id}
                            trade={trade}
                            initiator={playersWithProperties.find(p => p.id === trade.initiatorId)}
                            recipient={playersWithProperties.find(p => p.id === trade.recipientId)}
                            {...tradeModalProps}
                        />
                    )}
                </div>
            </section>
        </>
    )
}



type TradeItemProps = {
    trade: Trade,
    initiator?: PlayerWithProperties
    recipient?: PlayerWithProperties
} & Pick<ComponentProps<typeof TradeModal>, "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade">

export const TradeItem = ({ trade, initiator, recipient, ...tradeModalProps }: TradeItemProps) => {
    const offerDialogRef = useRef<HTMLDialogElement>(null)

    if (!initiator || !recipient) return null
    return <>
        <Button
            key={trade.id}
            className='btn btn-ghost'
            onClick={() => {
                offerDialogRef.current?.showModal()
            }}
        >
            {initiator?.name} to {recipient?.name}
        </Button>

        <TradeModal
            ref={offerDialogRef}
            initiator={initiator}
            recipient={recipient}
            onClose={() => {
                offerDialogRef.current?.close()
            }}
            tradeToInspect={trade}
            {...tradeModalProps}
        />
    </>
}

export default TradeSection