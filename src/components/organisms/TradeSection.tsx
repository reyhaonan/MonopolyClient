import type { Player } from '@/types/Player'
import type { Trade } from '@/types/Trade'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { useRef } from 'react'

type Props = {
    players: Player[]
    activeTrades: Trade[]
}

const TradeSection = ({ activeTrades, players }: Props) => {
    const playerId = useAuth()

    const player = players.find(p => p.id === playerId)

    const dialogRef = useRef<HTMLDialogElement>(null)

    return (
        <>
            <dialog ref={dialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Press ESC key or click the button below to close</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
            <section className='bg-base-200 rounded-box p-2'>
                <div className="flex justify-between items-center">
                    <h2 className='text-lg font-semibold'>Trade</h2>
                    <Button className='btn btn-primary btn-sm' onClick={() => dialogRef.current?.showModal()}>+ Trade</Button>
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