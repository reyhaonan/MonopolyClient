import type { PlayerWithProperties } from '@/types/Player';
import type { Trade, TradeOffer } from '@/types/Trade';
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

// --- TYPE DEFINITIONS ---

/** Defines the shape of the data managed by react-hook-form. */
type TradeFormData = {
    offer: string[];
    counterOffer: string[];
    moneyFromInitiator: number;
    moneyFromRecipient: number;
};

/** Props for the main TradeModal component. */
type TradeModalProps = {
    initiator: PlayerWithProperties | null;
    recipient: PlayerWithProperties | null;
    onClose: () => void;
    onInitiateTrade?: (tradeOffer: TradeOffer & { recipientId: string }) => void;
    onNegotiateTrade?: (tradeOffer: TradeOffer & { tradeId: string }) => void;
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

    const { control, reset, handleSubmit, watch, setValue } = useForm<TradeFormData>({
        defaultValues: {
            offer: [],
            counterOffer: [],
            moneyFromInitiator: 0,
            moneyFromRecipient: 0,
        },
        disabled: isViewing, // Disable form fields when just viewing a trade
    });

    // Effect to reset the form state when the trade context changes
    useEffect(() => {
        reset({
            offer: tradeToInspect?.propertyOffer || [],
            counterOffer: tradeToInspect?.propertyCounterOffer || [],
            moneyFromInitiator: tradeToInspect?.moneyFromInitiator || 0,
            moneyFromRecipient: tradeToInspect?.moneyFromRecipient || 0,
        })
    }, [tradeToInspect, reset]);

    const handleClose = () => {
        reset()
        setNegotiateMode(false);
        onClose();
    };

    const onSubmit: SubmitHandler<TradeFormData> = (data) => {
        if (negotiateMode) {
            if (!tradeToInspect || !recipient || playerId !== recipient.id) return;
            // When negotiating, the recipient's offer becomes the new initiator's offer
            onNegotiateTrade?.({
                offer: data.counterOffer,
                counterOffer: data.offer,
                moneyFromInitiator: data.moneyFromRecipient,
                moneyFromRecipient: data.moneyFromInitiator,
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

    const handleNegotiate = () => {
        if (!initiator || !recipient) return
        if (moneyFromInitiator > initiator.money) setValue("moneyFromInitiator", initiator.money)
        if (moneyFromRecipient > recipient.money) setValue("moneyFromRecipient", recipient.money)
        // Adjust overflow
        setNegotiateMode(true)
    };
    const handleReject = () => handleAction(onRejectTrade);
    const handleCancel = () => handleAction(onCancelTrade);
    const handleAccept = () => {
        if (hasGap) return
        handleAction(onAcceptTrade);
    }


    const [moneyFromInitiator, moneyFromRecipient, offer, counterOffer] = watch(["moneyFromInitiator", "moneyFromRecipient", "offer", "counterOffer"])

    // This is true if player no longer own the offered property
    const initiatorPropertyGap = !!initiator && offer.some(propertyId => initiator.propertiesOwned.findIndex(p => p.id === propertyId) === -1)
    const recipientPropertyGap = !!recipient && counterOffer.some(propertyId => recipient.propertiesOwned.findIndex(p => p.id === propertyId) === -1)
    // This is true if player current money is less than what is being offered
    const initiatorMoneyGap = !!initiator && initiator.money < moneyFromInitiator
    const recipientMoneyGap = !!recipient && recipient.money < moneyFromRecipient

    const hasGap = initiatorPropertyGap || recipientPropertyGap || initiatorMoneyGap || recipientMoneyGap

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
                            isInitiator={true}
                            propertyOffer={tradeToInspect?.propertyOffer}
                            propertyCounterOffer={tradeToInspect?.propertyCounterOffer}
                            countryGroupDict={countryGroupDict}
                        />
                    )}

                    <SwapIcon />

                    {recipient && (
                        <PlayerTradePanel
                            isViewing={isViewing}
                            player={recipient}
                            control={control}
                            isInitiator={false}
                            propertyOffer={tradeToInspect?.propertyOffer}
                            propertyCounterOffer={tradeToInspect?.propertyCounterOffer}
                            countryGroupDict={countryGroupDict}
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
                            {initiatorPropertyGap && `${initiator.name} no longer own the property for this trade`}
                        </div>
                        <div>
                            {recipientPropertyGap && `${recipient.name} no longer own the property for this trade`}
                        </div>
                    </div>}
                {/* --- Action Buttons --- */}
                <div className="w-full flex justify-center">
                    {(!tradeToInspect || negotiateMode) && (
                        <Button type="submit" className="btn btn-primary justify-end">
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
    isInitiator,
    isViewing,
    propertyOffer = [],
    propertyCounterOffer = [],
    countryGroupDict
}: {
    player: PlayerWithProperties;
    control: Control<TradeFormData>;
    isInitiator: boolean;
    isViewing: boolean
    propertyOffer?: string[]
    propertyCounterOffer?: string[],
    countryGroupDict: Record<ColorGroup, CountryProperty[]>
}) => {
    const propertyFieldName = isInitiator ? 'offer' : 'counterOffer';
    const moneyFieldName = isInitiator ? 'moneyFromInitiator' : 'moneyFromRecipient';
    const offeredProperties = isViewing ? (isInitiator ? propertyOffer : propertyCounterOffer) : []

    const propertiesToList = isViewing
        ? player.propertiesOwned.filter((p) => offeredProperties.includes(p.id))
        : player.propertiesOwned;

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
                                {...field}
                                type="number"
                                className="input input-bordered w-full text-center"
                                required
                                min={0}
                                max={player.money}
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                onBlur={() => {
                                    // Clamp value on blur to be within valid range
                                    const value = Math.min(player.money, Math.max(0, field.value));
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
                                    {...field}
                                    type="range"
                                    min={0}
                                    max={player.money}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="range range-primary range-sm mt-2"
                                />
                                <div className="flex justify-between px-1 text-xs">
                                    <span>$0</span>
                                    <span>${player.money}</span>
                                </div>
                            </>
                        )}
                    />
                </div>

                {/* Properties List Section */}
                <ul className="menu p-0 rounded-box w-full space-y-1 max-h-48 overflow-auto">
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
                                                    type="checkbox"
                                                    className="hidden"
                                                    value={property.id}
                                                    checked={isChecked}
                                                    disabled={propertyIsDisabled}
                                                    onChange={(e) => {
                                                        const updatedValue = isChecked
                                                            ? field.value.filter((id) => id !== e.target.value)
                                                            : [...field.value, e.target.value];
                                                        field.onChange(updatedValue);
                                                    }}
                                                />
                                                {property.name}
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
