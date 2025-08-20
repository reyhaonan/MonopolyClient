import type { PropertySpace } from '@/types/BoardSpace'
import type { Player, PlayerWithProperties } from '@/types/Player'
import classNames from 'classnames'
import React, { useState, type Ref } from 'react'
import Button from '../atoms/Button'
import Modal from './Modal'

type TradeOffer = {
    offer: PropertySpace['id'][]
    counterOffer: PropertySpace['id'][]
    moneyFromInitiator: number
    moneyFromRecipient: number
}

type Props = {
    initiator: PlayerWithProperties | null
    recipient: PlayerWithProperties | null
    ref: Ref<HTMLDialogElement>
    onClose: () => void
    onOffer: ({ offer, counterOffer, moneyFromInitiator, moneyFromRecipient }: TradeOffer) => void
}

const TradeModal = ({ ref, initiator, recipient, onClose, onOffer }: Props) => {
    const [offer, setOffer] = useState<PropertySpace['id'][]>([])
    const [counterOffer, setCounterOffer] = useState<PropertySpace['id'][]>([])
    const [moneyFromInitiator, setMoneyFromInitiator] = useState(0)
    const [moneyFromRecipient, setMoneyFromRecipient] = useState(0)

    const closeOfferModal = () => {
        setCounterOffer([])
        setOffer([])
        setMoneyFromInitiator(0)
        setMoneyFromRecipient(0)
        onClose()
    }

    const handleToggleOffer = (propertyId: PropertySpace['id']) => {
        setOffer((currentOffer) =>
            currentOffer.includes(propertyId)
                ? currentOffer.filter((id) => id !== propertyId)
                : [...currentOffer, propertyId]
        )
    }

    const handleToggleCounterOffer = (propertyId: PropertySpace['id']) => {
        setCounterOffer((currentCounterOffer) =>
            currentCounterOffer.includes(propertyId)
                ? currentCounterOffer.filter((id) => id !== propertyId)
                : [...currentCounterOffer, propertyId]
        )
    }

    const handleSendTrade = () => {
        onOffer({ offer, counterOffer, moneyFromInitiator, moneyFromRecipient })
        closeOfferModal()
    }

    const renderPlayerSection = (player: PlayerWithProperties, isInitiator: boolean) => {
        const properties = player?.propertiesOwned || []
        const selectedProperties = isInitiator ? offer : counterOffer
        const handleToggle = isInitiator ? handleToggleOffer : handleToggleCounterOffer
        const money = isInitiator ? moneyFromInitiator : moneyFromRecipient
        const setMoney = isInitiator ? setMoneyFromInitiator : setMoneyFromRecipient
        const maxMoney = isInitiator ? initiator?.money : recipient?.money

        return (
            <div className="flex-1">
                <h4 className="playerName p-2 font-semibold text-lg capitalize">{player?.name}</h4>

                <div className="w-full mb-2">
                    <input
                        type="range"
                        min={0}
                        max={maxMoney}
                        value={money}
                        onChange={(e) => setMoney(Number(e.target.value))}
                        className="range range-sm"
                    />
                    <div className="flex justify-between px-2.5 mt-2 text-xs">
                        <span>0</span>
                        <span>{maxMoney}</span>
                    </div>
                </div>
                <input
                    type="number"
                    className="input w-full"
                    required
                    min={0}
                    value={money}
                    onChange={(e) => setMoney(Number(e.target.value))}
                    max={maxMoney}
                />
                <ul className="menu px-0 rounded-box w-full space-y-1 mt-4">
                    {properties.map((p) => {
                        const checked = selectedProperties.includes(p.id)
                        return (
                            <li key={p.id}>
                                <label className={classNames('btn capitalize flex', checked && 'btn-accent')}>
                                    <input
                                        value={p.id}
                                        type="checkbox"
                                        name="offer"
                                        className="hidden"
                                        checked={checked}
                                        onChange={() => handleToggle(p.id)}
                                    />
                                    {p.name}
                                </label>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    return (
        <Modal ref={ref} onClose={closeOfferModal}>
            <h3 className="font-bold text-lg">Negotiate</h3>
            <div className="modal-action">
                <div className="flex w-full">
                    {initiator && renderPlayerSection(initiator, true)}
                    <div className="">S</div>
                    {recipient && renderPlayerSection(recipient, false)}
                </div>
            </div>
            <div className="w-full flex justify-center">
                <Button onClick={handleSendTrade} className="btn btn-primary">
                    Send Trade
                </Button>
            </div>
        </Modal>
    )
}

export default TradeModal