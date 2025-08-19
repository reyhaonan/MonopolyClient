import type { Player } from '@/types/Player'
import type { Trade } from '@/types/Trade'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { useRef, useState } from 'react'
import type { BoardSpace, PropertySpace } from '@/types/BoardSpace'
import classNames from 'classnames'

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

    const player = playersWithProperties.find(p => p.id === playerId)

    const otherPlayers = playersWithProperties.filter(p => p.id !== playerId)

    const [selectedPlayerToTrade, setSelectedPlayerToTrade] = useState<typeof playersWithProperties[number] | null>(null)

    const selectPlayerDialogRef = useRef<HTMLDialogElement>(null)
    const offerDialogRef = useRef<HTMLDialogElement>(null)

    const [offer, setOffer] = useState<PropertySpace['id'][]>([])
    const [counterOffer, setCounterOffer] = useState<PropertySpace['id'][]>([])

    const handleOfferChange = (checkedPropertyId: PropertySpace['id']) => {
        const isChecked = offer.some(propertyId => propertyId === checkedPropertyId)
        if (isChecked) {
            setOffer(
                offer.filter(
                    (propertyId) => propertyId !== checkedPropertyId
                )
            );
        } else {
            setOffer(state => state.concat(checkedPropertyId));
        }
    };
    const handleCounterOfferChange = (checkedPropertyId: PropertySpace['id']) => {
        const isChecked = counterOffer.some(propertyId => propertyId === checkedPropertyId)
        if (isChecked) {
            setCounterOffer(
                counterOffer.filter(
                    (propertyId) => propertyId !== checkedPropertyId
                )
            );
        } else {
            setCounterOffer(state => state.concat(checkedPropertyId));
        }
    };

    return (
        <>
            <dialog ref={selectPlayerDialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Trade with...</h3>
                    <div className="modal-action">
                        <ul className="menu rounded-box w-full">
                            {otherPlayers.map(p =>
                                <li key={p.id}>
                                    <Button className='btn capitalize' onClick={() => {
                                        setSelectedPlayerToTrade(p)
                                        selectPlayerDialogRef.current?.close()
                                        offerDialogRef.current?.showModal()
                                    }}>{p.name}</Button>
                                </li>)}
                        </ul>
                    </div>
                </div>
            </dialog>

            <dialog ref={offerDialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Negotiate</h3>
                    <div className="modal-action">
                        <div className="flex w-full">
                            <div className="player flex-1">
                                <ul className="menu rounded-box w-full">
                                    {player?.propertiesOwned.map(p => {
                                        const checked = offer.some(propertyId => propertyId === p.id)
                                        return <li key={p.id}>
                                            <label className={classNames('btn capitalize flex', checked && "btn-primary")}>
                                                <input
                                                    value={p.id}
                                                    type='checkbox'
                                                    name='offer'
                                                    className='hidden'
                                                    checked={checked}
                                                    onChange={() => handleOfferChange(p.id)}
                                                />
                                                {p.name}
                                            </label>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <div className="">S</div>
                            <div className="otherPlayer flex-1">
                                <ul className="menu rounded-box w-full">
                                    {selectedPlayerToTrade?.propertiesOwned.map(p => {
                                        const checked = counterOffer.some(propertyId => propertyId === p.id)
                                        return <li key={p.id}>
                                            <label className={classNames('btn capitalize flex', checked && "btn-primary")}>
                                                <input
                                                    value={p.id}
                                                    type='checkbox'
                                                    name='offer'
                                                    className='hidden'
                                                    checked={checked}
                                                    onChange={() => handleCounterOfferChange(p.id)}
                                                />
                                                {p.name}
                                            </label>
                                        </li>
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>


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