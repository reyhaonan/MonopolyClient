import type { PlayerWithProperties } from '@/types/Player';
import type { Trade } from '@/types/Trade';
import { useAuth } from '@/hooks/useAuth';
import classNames from 'classnames';
import { useEffect, useState, forwardRef } from 'react';
import { Controller, useForm, type SubmitHandler, type Control } from 'react-hook-form';
import Button from '../atoms/Button';
import Modal from './Modal';
import type { CountryProperty } from '@/types/BoardSpace';
import type { ColorGroup } from '@/enums/ColorGroup';
import { RentStage } from '@/enums/RentStage';
import CheckIcon from '../atoms/icons/CheckIcon';
import XMarkIcon from '../atoms/icons/XMarkIcon';
import SwapIcon from '../atoms/icons/SwapIcon';
import PlayerIndicator from '../atoms/PlayerIndicator';
import PaperAirplaneIcon from '../atoms/icons/PaperAirplaneIcon';
import LockOpenIcon from '../atoms/icons/LockOpenIcon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// --- TYPE DEFINITIONS ---
const tradeSchema = z.object({
    offer: z.array(z.string()),
    counterOffer: z.array(z.string()),
    moneyFromInitiator: z.number().min(0), // Added a minimum value for money
    moneyFromRecipient: z.number().min(0),
    getOutOfJailCardFromInitiator: z.array(z.number()),
    getOutOfJailCardFromRecipient: z.array(z.number()),
}).refine(arg => {
    return arg.offer.length > 0 || arg.counterOffer.length > 0 || arg.moneyFromInitiator > 0 || arg.moneyFromRecipient > 0 || arg.getOutOfJailCardFromInitiator.length > 0 || arg.getOutOfJailCardFromRecipient.length > 0
});

// A TypeScript type can be inferred from the schema for convenience
type TradeSchema = z.infer<typeof tradeSchema>;


type TradeModalProps = {
    initiator: PlayerWithProperties | null;
    recipient: PlayerWithProperties | null;
    onClose: () => void;
    onInitiateTrade?: (tradeOffer: TradeSchema & { recipientId: string }) => void;
    onNegotiateTrade?: (tradeOffer: TradeSchema & { tradeId: string }) => void;
    onRejectTrade?: (tradeId: string) => void;
    onCancelTrade?: (tradeId: string) => void;
    onAcceptTrade?: (tradeId: string) => void;
    tradeToInspect: Trade | null;
    countryGroupDict: Record<ColorGroup, CountryProperty[]>
};


const TradeModal = forwardRef<HTMLDialogElement, TradeModalProps>(({
    initiator,
    recipient,
    onClose,
    tradeToInspect,
    onInitiateTrade,
    onNegotiateTrade,
    onRejectTrade,
    onCancelTrade,
    onAcceptTrade,
    countryGroupDict
}, ref) => {
    const [negotiateMode, setNegotiateMode] = useState(false);
    const playerId = useAuth();

    // Determine the user's role in the current trade context
    const isViewing = !!tradeToInspect && !negotiateMode;
    const isMyTurnAsRecipient = tradeToInspect?.recipientId === playerId && isViewing;
    const isMyTurnAsInitiator = tradeToInspect?.initiatorId === playerId && isViewing;

    const { control, reset, handleSubmit, watch, setValue, formState: { isValid } } = useForm<TradeSchema>({
        defaultValues: {
            offer: [],
            counterOffer: [],
            moneyFromInitiator: 0,
            moneyFromRecipient: 0,
            getOutOfJailCardFromInitiator: [],
            getOutOfJailCardFromRecipient: []
        },
        mode: "onChange",
        resolver: zodResolver(tradeSchema),
    });

    // Effect to reset the form state when the trade context changes
    useEffect(() => {
        reset({
            offer: tradeToInspect?.propertyOffer || [],
            counterOffer: tradeToInspect?.propertyCounterOffer || [],
            moneyFromInitiator: tradeToInspect?.moneyFromInitiator || 0,
            moneyFromRecipient: tradeToInspect?.moneyFromRecipient || 0,
            getOutOfJailCardFromInitiator: Array.from(Array(tradeToInspect?.getOutOfJailCardFromInitiator ?? 0).keys()),
            getOutOfJailCardFromRecipient: Array.from(Array(tradeToInspect?.getOutOfJailCardFromRecipient ?? 0).keys()),
        })
    }, [tradeToInspect, reset]);

    const handleClose = () => {
        reset()
        setNegotiateMode(false);
        onClose();
    };

    const onSubmit: SubmitHandler<TradeSchema> = (data) => {
        console.log("BAJ", data)
        if (negotiateMode) {
            if (!tradeToInspect || !recipient || playerId !== recipient.id) return;
            // When negotiating, the recipient's offer becomes the new initiator's offer
            onNegotiateTrade?.({
                offer: data.counterOffer,
                counterOffer: data.offer,
                moneyFromInitiator: data.moneyFromRecipient,
                moneyFromRecipient: data.moneyFromInitiator,
                getOutOfJailCardFromInitiator: data.getOutOfJailCardFromRecipient,
                getOutOfJailCardFromRecipient: data.getOutOfJailCardFromInitiator,
                tradeId: tradeToInspect.id,
            });
        } else {
            if (!recipient) return;
            onInitiateTrade?.({ ...data, recipientId: recipient.id });
        }
        handleClose();
    };

    const handleAction = (action?: (tradeId: string) => void) => {
        if (!tradeToInspect) return;
        action?.(tradeToInspect.id);
        handleClose();
    };


    const handleReject = () => handleAction(onRejectTrade);
    const handleCancel = () => handleAction(onCancelTrade);
    const handleAccept = () => {
        if (hasGap) return
        handleAction(onAcceptTrade);
    }


    const [moneyFromInitiator, moneyFromRecipient, offer, counterOffer, getOutOfJailCardFromInitiator, getOutOfJailCardFromRecipient] = watch(["moneyFromInitiator", "moneyFromRecipient", "offer", "counterOffer", "getOutOfJailCardFromInitiator", "getOutOfJailCardFromRecipient"])
    console.log("BA", { moneyFromInitiator, moneyFromRecipient, offer, counterOffer, getOutOfJailCardFromInitiator, getOutOfJailCardFromRecipient })

    // This is true if player no longer own the offered property
    const initiatorPropertyGap = !!initiator && offer.some(propertyId => initiator.propertiesOwned.findIndex(p => p.id === propertyId) === -1)
    const recipientPropertyGap = !!recipient && counterOffer.some(propertyId => recipient.propertiesOwned.findIndex(p => p.id === propertyId) === -1)
    // This is true if player current money is less than what is being offered
    const initiatorMoneyGap = !!initiator && initiator.money > 0 && initiator.money < moneyFromInitiator
    const recipientMoneyGap = !!recipient && recipient.money > 0 && recipient.money < moneyFromRecipient

    const initiatorCardGap = !!initiator && initiator.getOutOfJailFreeCards < getOutOfJailCardFromInitiator.length
    const recipientCardGap = !!recipient && recipient.getOutOfJailFreeCards < getOutOfJailCardFromRecipient.length

    const hasGap = initiatorPropertyGap || recipientPropertyGap || initiatorMoneyGap || recipientMoneyGap || initiatorCardGap || recipientCardGap

    const handleNegotiate = () => {
        if (!initiator || !recipient) return
        // Adjust gap on negotiate
        if (initiatorMoneyGap) setValue("moneyFromInitiator", 0, { shouldDirty: false })
        if (recipientMoneyGap) setValue("moneyFromRecipient", 0, { shouldDirty: false })

        if (initiatorCardGap) setValue("getOutOfJailCardFromInitiator", [], { shouldDirty: false })
        if (recipientCardGap) setValue("getOutOfJailCardFromRecipient", [], { shouldDirty: false })

        if (initiatorPropertyGap) setValue("offer", [], { shouldDirty: false })
        if (recipientPropertyGap) setValue("counterOffer", [], { shouldDirty: false })
        setNegotiateMode(true)
    };

    return (
        <Modal ref={ref} onClose={handleClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="font-bold text-2xl text-center">{tradeToInspect && tradeToInspect.negotiateCount > 0 ? `Negotiation no. ${tradeToInspect.negotiateCount}` : "Trade"}</h3>

                <div className={classNames("flex items-start justify-center w-full gap-2 sm:gap-4 transition-all", negotiateMode && "flex-row-reverse")}>
                    {initiator && (
                        <PlayerTradePanel
                            isViewing={isViewing}
                            player={initiator}
                            control={control}
                            propertyFieldName={'offer'}
                            moneyFieldName={'moneyFromInitiator'}
                            getOutOfJailCardFieldName={'getOutOfJailCardFromInitiator'}
                            offeredProperties={offer}
                            countryGroupDict={countryGroupDict}
                            cardOffer={getOutOfJailCardFromInitiator}
                        />
                    )}

                    <SwapIcon />

                    {recipient && (
                        <PlayerTradePanel
                            isViewing={isViewing}
                            player={recipient}
                            control={control}
                            propertyFieldName={'counterOffer'}
                            moneyFieldName={'moneyFromRecipient'}
                            getOutOfJailCardFieldName={'getOutOfJailCardFromRecipient'}
                            offeredProperties={counterOffer}
                            countryGroupDict={countryGroupDict}
                            cardOffer={getOutOfJailCardFromRecipient}
                        />
                    )}
                </div>

                {isViewing &&
                    <div className="text-error text-sm text-center">
                        <div>
                            {initiatorMoneyGap && `${initiator.name} doesn't have enough money for this trade`}
                        </div>
                        <div>
                            {recipientMoneyGap && `${recipient.name} doesn't have enough money for this trade`}
                        </div>
                        <div>
                            {initiatorCardGap && `${initiator.name} doesn't have enough get out of jail card for this trade`}
                        </div>
                        <div>
                            {recipientCardGap && `${recipient.name} doesn't have enough get out of jail card for this trade`}
                        </div>
                        <div>
                            {initiatorPropertyGap && `${initiator.name} no longer own some the property for this trade`}
                        </div>
                        <div>
                            {recipientPropertyGap && `${recipient.name} no longer own some the property for this trade`}
                        </div>
                    </div>}
                {/* --- Action Buttons --- */}
                <div className="w-full flex justify-center">
                    {(!tradeToInspect || negotiateMode) && (
                        <Button type="submit" className="btn btn-primary justify-end" disabled={!isValid}>
                            <PaperAirplaneIcon className='size-4' />Send Offer
                        </Button>
                    )}

                    {isMyTurnAsRecipient && (
                        <div className="flex flex-wrap justify-center gap-2 w-full">
                            <Button type="button" onClick={handleNegotiate} className="btn btn-primary w-full sm:w-auto sm:flex-1">
                                Negotiate
                            </Button>
                            <Button type="button" onClick={handleReject} className="btn btn-ghost btn-error w-full sm:w-auto sm:flex-1">
                                <XMarkIcon />Reject
                            </Button>
                            <Button type="button" disabled={hasGap} onClick={handleAccept} className="btn btn-success btn-soft w-full sm:w-auto sm:flex-1">
                                <CheckIcon />Accept
                            </Button>
                        </div>
                    )}

                    {isMyTurnAsInitiator && (
                        <Button type="button" onClick={handleCancel} className="btn btn-outline btn-error">
                            Cancel Trade
                        </Button>
                    )}
                </div>
            </form>
        </Modal >
    );
});


export default TradeModal;


const PlayerTradePanel = ({
    player,
    control,
    isViewing,
    offeredProperties = [],
    countryGroupDict,
    propertyFieldName,
    moneyFieldName,
    getOutOfJailCardFieldName,
    cardOffer = []
}: {
    player: PlayerWithProperties;
    control: Control<TradeSchema>;
    propertyFieldName: "offer" | "counterOffer"
    moneyFieldName: "moneyFromInitiator" | "moneyFromRecipient"
    getOutOfJailCardFieldName: "getOutOfJailCardFromInitiator" | "getOutOfJailCardFromRecipient"
    isViewing: boolean
    offeredProperties?: string[]
    cardOffer?: number[]
    countryGroupDict: Record<ColorGroup, CountryProperty[]>
}) => {
    const propertiesToList = isViewing
        ? player.propertiesOwned.filter((p) => offeredProperties.includes(p.id))
        : player.propertiesOwned;

    const cardToList = isViewing ? cardOffer : Array.from(Array(player.getOutOfJailFreeCards).keys())

    return (
        <div className="flex-1 p-2 border border-base-300 rounded-lg bg-base-200">
            <h4 className="p-2 text-center"><PlayerIndicator player={player} /></h4>
            <div className="space-y-4">
                {/* Money Input Section */}
                <div>
                    <Controller
                        control={control}
                        name={moneyFieldName}
                        render={({ field }) => (
                            <input
                                readOnly={isViewing}
                                type="number"
                                className="input input-bordered w-full text-center"
                                required
                                min={0}
                                max={Math.max(0, player.money)}
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                onBlur={() => {
                                    // Clamp value on blur to be within valid range
                                    const value = Math.min(Math.max(0, player.money), Math.max(0, field.value));
                                    field.onChange(value);
                                }}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name={moneyFieldName}
                        render={({ field }) => (
                            <>
                                <input
                                    readOnly={isViewing}
                                    type="range"
                                    min={0}
                                    max={Math.max(0, player.money)}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="range range-primary range-sm mt-2"
                                />
                                <div className="flex justify-between px-1 text-xs">
                                    <span>$0</span>
                                    <span>${Math.max(0, player.money)}</span>
                                </div>
                            </>
                        )}
                    />
                </div>

                {/* Properties List Section */}
                <ul className="menu p-0 w-full space-y-1 overflow-auto">
                    {cardToList.map((card) =>
                        <li key={card}>
                            <Controller
                                control={control}
                                name={getOutOfJailCardFieldName}
                                render={({ field }) => {
                                    const isChecked = field.value.includes(card);
                                    return (
                                        <label
                                            className={classNames(
                                                'btn w-full justify-start',
                                                isChecked ? 'btn-accent' : 'btn-ghost',
                                            )}
                                        >
                                            <input
                                                readOnly={isViewing}
                                                type="checkbox"
                                                className="hidden"
                                                value={card}
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const updatedValue = isChecked
                                                        ? field.value.filter((id) => id !== Number(e.target.value))
                                                        : [...field.value, Number(e.target.value)];
                                                    field.onChange(updatedValue);
                                                }}

                                            />
                                            <LockOpenIcon className='size-4' /> Get out of jail card
                                        </label>
                                    );
                                }}
                            />
                        </li>
                    )}

                    {propertiesToList.map((property) => {
                        const playerIsGroupOwner = property.$type === "country" && countryGroupDict[(property as CountryProperty).group].every(c => c.ownerId === player.id)
                        const groupHasHouse = property.$type === "country" && countryGroupDict[(property as CountryProperty).group].some(c => c.currentRentStage > RentStage.Unimproved)
                        const propertyIsDisabled = playerIsGroupOwner && groupHasHouse
                        return (
                            <li key={property.id}>
                                <Controller
                                    control={control}
                                    name={propertyFieldName}
                                    render={({ field }) => {
                                        const isChecked = field.value.includes(property.id);
                                        return (
                                            <label
                                                className={classNames(
                                                    'btn w-full justify-start',
                                                    isChecked ? 'btn-accent' : 'btn-ghost',
                                                    propertyIsDisabled && "btn-disabled"
                                                )}
                                            >
                                                <input
                                                    readOnly={propertyIsDisabled || isViewing}
                                                    type="checkbox"
                                                    className="hidden"
                                                    value={property.id}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const updatedValue = isChecked
                                                            ? field.value.filter((id) => id !== e.target.value)
                                                            : [...field.value, e.target.value];
                                                        field.onChange(updatedValue);
                                                    }}
                                                />
                                                {property.name} {property.isMortgaged ? <span className="badge badge-xs">Mortgaged</span> : ""}
                                            </label>
                                        );
                                    }}
                                />
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};
