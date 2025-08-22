import type { Player, PlayerWithProperties } from '@/types/Player'
import type { Trade } from '@/types/Trade'
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
    disableTrade: boolean
} & Pick<ComponentProps<typeof TradeModal>, "onInitiateTrade" | "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade" | "countryGroupData">

const TradeSection = ({ activeTrades, players, spaces, onInitiateTrade, disableTrade, countryGroupData, ...tradeModalProps }: Props) => {
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
                                <Button className='btn' onClick={() => {
                                    setRecipient(p)
                                    selectPlayerDialogRef.current?.close()
                                    offerDialogRef.current?.showModal()
                                }}>{p.name}</Button>
                            </li>)}
                    </ul>
                </div>
            </Modal >

            <TradeModal
                countryGroupData={countryGroupData}
                ref={offerDialogRef}
                initiator={player}
                recipient={recipient}
                onClose={() => {
                    offerDialogRef.current?.close()
                }}
                onInitiateTrade={onInitiateTrade}
                tradeToInspect={null}
            />


            <section className='bg-base-100 rounded-box shadow-md p-2'>
                <div className="flex justify-between items-center">
                    <h6 className="p-2 pb-2 text-xs opacity-60 tracking-wide">Trades</h6>
                    {!disableTrade && <Button className='btn btn-primary btn-square btn-sm btn-soft' onClick={() => selectPlayerDialogRef.current?.showModal()}>+</Button>}
                </div>
                <div className="trade-lists flex flex-col">
                    {activeTrades.map(trade =>
                        <TradeItem
                            key={trade.id}
                            trade={trade}
                            initiator={playersWithProperties.find(p => p.id === trade.initiatorId)}
                            recipient={playersWithProperties.find(p => p.id === trade.recipientId)}
                            {...tradeModalProps}
                            countryGroupData={countryGroupData}
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
} & Pick<ComponentProps<typeof TradeModal>, "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade" | "countryGroupData">

export const TradeItem = ({ trade, initiator, recipient, ...tradeModalProps }: TradeItemProps) => {
    const offerDialogRef = useRef<HTMLDialogElement>(null)

    if (!initiator || !recipient) return null
    return <>
        <Button
            key={trade.id}
            className='btn btn-ghost mt-2'
            onClick={() => {
                offerDialogRef.current?.showModal()
            }}
        >
            <span className="">{initiator?.name}</span> ↔ <span className="">{recipient?.name}</span>
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