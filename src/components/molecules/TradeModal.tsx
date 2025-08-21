import type { PlayerWithProperties } from '@/types/Player'
import classNames from 'classnames'
import { useState, type Ref } from 'react'
import Button from '../atoms/Button'
import Modal from './Modal'
import type { Trade, TradeOffer } from '@/types/Trade'
import { useAuth } from '@/hooks/useAuth'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'



type TradeModalProps = {
    initiator: PlayerWithProperties | null
    recipient: PlayerWithProperties | null
    ref: Ref<HTMLDialogElement>
    onClose: () => void
    onInitiateTrade?: (tradeOffer: TradeOffer & { recipientId: string }) => void,
    onNegotiateTrade?: (tradeOffer: TradeOffer & { tradeId: string }) => void,
    onRejectTrade?: (tradeId: string) => void,
    onCancelTrade?: (tradeId: string) => void,
    onAcceptTrade?: (tradeId: string) => void,
    tradeToInspect: Trade | null
}

const TradeModal = ({
    ref,
    initiator,
    recipient,
    onClose,
    tradeToInspect,
    onInitiateTrade,
    onNegotiateTrade,
}: TradeModalProps) => {

    const [negotiateMode, setNegotiateMode] = useState(false)

    const playerId = useAuth()


    const { control, reset, handleSubmit } = useForm({
        values: {
            offer: tradeToInspect?.propertyOffer || [],
            counterOffer: tradeToInspect?.propertyCounterOffer || [],
            moneyFromInitiator: tradeToInspect?.moneyFromInitiator || 0,
            moneyFromRecipient: tradeToInspect?.moneyFromRecipient || 0
        },
        disabled: !!tradeToInspect && !negotiateMode
    })

    const closeOfferModal = () => {
        reset()
        setNegotiateMode(false)
        onClose()
    }

    const onSubmit: SubmitHandler<any> = ({ offer, counterOffer, moneyFromInitiator, moneyFromRecipient }) => {
        if (!recipient) throw new Error("No recipient")
        if (negotiateMode) {
            if (!tradeToInspect) throw new Error("No trade to negotiate")
            if (playerId !== recipient.id) throw new Error("You are not permitted to do this action")
            // Negotiate just flips around so...
            onNegotiateTrade?.({
                offer: counterOffer,
                counterOffer: offer,
                moneyFromInitiator: moneyFromRecipient,
                moneyFromRecipient: moneyFromInitiator,
                tradeId: tradeToInspect.id
            })

        }
        else onInitiateTrade?.({ offer, counterOffer, moneyFromInitiator, moneyFromRecipient, recipientId: recipient.id })
        closeOfferModal()
    }


    const handleNegotiateTrade = () => {
        setNegotiateMode(true)
    }

    const handleRejectTrade = () => {
        if (!recipient) throw new Error("No recipient")
        if (playerId !== recipient.id) throw new Error("You are not permitted to do this action")
        throw new Error('Function not implemented.')
    }

    const handleAcceptTrade = () => {
        if (!recipient) throw new Error("No recipient")
        if (playerId !== recipient.id) throw new Error("You are not permitted to do this action")
        throw new Error('Function not implemented.')
    }
    const handleCancelTrade = () => {
        if (!initiator) throw new Error("No initiator")
        if (playerId !== initiator.id) throw new Error("You are not permitted to do this action")
        throw new Error('Function not implemented.')
    }



    const renderPlayerSection = (player: PlayerWithProperties, isInitiator: boolean) => {
        const properties = player?.propertiesOwned || []
        const selectedProperties = isInitiator ? "offer" : "counterOffer"
        const money = isInitiator ? "moneyFromInitiator" : "moneyFromRecipient"
        const maxMoney = isInitiator ? initiator?.money : recipient?.money

        return (
            <div className={classNames("flex-1")}>
                <h4 className="playerName p-2 font-semibold text-lg capitalize">{player?.name}</h4>

                <div className="w-full mb-2">
                    {/* Checkbox */}
                    <Controller
                        control={control}
                        name={money}
                        render={({ field }) =>
                            <input
                                {...field}
                                type="range"
                                min={0}
                                max={maxMoney}
                                value={field.value}
                                onChange={(e) => {
                                    field.onChange(Number(e.target.value))
                                }}
                                className="range range-sm"
                            />}
                    />
                    <div className="flex justify-between px-2.5 mt-2 text-xs">
                        <span>0</span>
                        <span>{maxMoney}</span>
                    </div>
                </div>
                {/* Input */}
                <Controller
                    control={control}
                    name={money}
                    render={({ field }) =>
                        <input
                            {...field}
                            type="number"
                            className="input w-full"
                            required
                            min={0}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            onBlur={() => {
                                field.onChange(Math.min(maxMoney!, Math.max(0, field.value)))
                            }}
                            max={maxMoney}

                        />}
                />
                <ul className="menu px-0 rounded-box w-full space-y-1 mt-4">
                    {properties.map((p) => {
                        return (
                            <li key={p.id}>
                                <Controller
                                    control={control}
                                    name={selectedProperties}
                                    render={({ field }) => {
                                        const checked = field.value.includes(p.id)
                                        return <label className={classNames('btn capitalize flex', checked && 'btn-accent')}>
                                            <input
                                                {...field}
                                                value={p.id}
                                                type="checkbox"
                                                name="offer"
                                                className="hidden"
                                                checked={checked}
                                                onChange={(e) => {
                                                    field.onChange(
                                                        field.value.includes(e.target.value)
                                                            ? field.value.filter((id) => id !== e.target.value)
                                                            : field.value.concat(e.target.value)
                                                    )
                                                }}
                                            />
                                            {p.name}
                                        </label>
                                    }
                                    }
                                />
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    return (
        <Modal ref={ref} onClose={closeOfferModal}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="font-bold text-lg">Negotiate</h3>
                <div className="modal-action">
                    <div className={classNames("flex w-full", negotiateMode && "flex-row-reverse")}>
                        {initiator && renderPlayerSection(initiator, true)}
                        <div className="">Swap</div>
                        {recipient && renderPlayerSection(recipient, false)}
                    </div>
                </div>
                <div className="w-full flex justify-center">
                    {(!tradeToInspect || negotiateMode) &&
                        <Button type='submit' className="btn btn-primary">
                            Send Trade
                        </Button>
                    }

                    {(tradeToInspect && tradeToInspect.recipientId === playerId && !negotiateMode) &&
                        <div className='mt-2 gap-2 flex flex-wrap'>
                            <Button type='button' onClick={handleNegotiateTrade} className="btn btn-primary w-full">
                                Negotiate
                            </Button>
                            {/* TODO */}
                            <Button type='button' onClick={handleRejectTrade} className="btn btn-primary btn-ghost flex-1">
                                Reject
                            </Button>
                            {/* TODO */}
                            <Button type='button' onClick={handleAcceptTrade} className="btn btn-primary btn-outline flex-1">
                                Accept
                            </Button>
                        </div>
                    }

                    {(tradeToInspect && tradeToInspect.initiatorId === playerId && !negotiateMode) &&
                        <Button type='button' onClick={handleCancelTrade} className="btn btn-primary btn-outline flex-1">
                            Cancel Trade
                        </Button>
                    }
                </div>
            </form>
        </Modal>
    )
}

export default TradeModal