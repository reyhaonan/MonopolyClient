import type { Player, PlayerWithProperties } from '@/types/Player'
import type { Trade } from '@/types/Trade'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { useRef, useState, type ComponentProps } from 'react'
import type { BoardSpace, PropertySpace } from '@/types/BoardSpace'
import TradeModal from '../molecules/TradeModal'
import Modal from '../molecules/Modal'
import PlayerIndicator from '../atoms/PlayerIndicator'
import SwapIcon from '../atoms/icons/SwapIcon'


type Props = {
    players: Player[]
    activeTrades: Trade[]
    spaces: BoardSpace[]
    disableTrade: boolean
} & Pick<ComponentProps<typeof TradeModal>, "onInitiateTrade" | "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade" | "countryGroupDict">

const TradeSection = ({ activeTrades, players, spaces, onInitiateTrade, disableTrade, countryGroupDict, ...tradeModalProps }: Props) => {
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
            <section className='bg-base-100 rounded-box p-2'>
                <div className="flex justify-between items-center">
                    <h6 className="p-2 pb-2 text-xs opacity-60 tracking-wide">Trades</h6>
                    {!disableTrade &&
                        <Button className='btn btn-primary btn-square btn-sm btn-soft' onClick={() => selectPlayerDialogRef.current?.showModal()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                            </svg>
                        </Button>}
                </div>
                <div className="trade-lists flex flex-col">
                    {activeTrades.map(trade =>
                        <TradeItem
                            key={trade.id}
                            trade={trade}
                            initiator={playersWithProperties.find(p => p.id === trade.initiatorId)}
                            recipient={playersWithProperties.find(p => p.id === trade.recipientId)}
                            {...tradeModalProps}
                            countryGroupDict={countryGroupDict}
                        />
                    )}
                </div>
            </section>

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
                                }}><PlayerIndicator player={p} /></Button>
                            </li>)}
                    </ul>
                </div>
            </Modal >

            <TradeModal
                countryGroupDict={countryGroupDict}
                ref={offerDialogRef}
                initiator={player}
                recipient={recipient}
                onClose={() => {
                    offerDialogRef.current?.close()
                }}
                onInitiateTrade={onInitiateTrade}
                tradeToInspect={null}
            />
        </>
    )
}



type TradeItemProps = {
    trade: Trade,
    initiator?: PlayerWithProperties
    recipient?: PlayerWithProperties
} & Pick<ComponentProps<typeof TradeModal>, "onNegotiateTrade" | "onAcceptTrade" | "onCancelTrade" | "onRejectTrade" | "countryGroupDict">

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
            <PlayerIndicator player={initiator} />
            <SwapIcon className='size-4' />
            <PlayerIndicator player={recipient} />
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