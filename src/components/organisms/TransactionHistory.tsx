import { TransactionType } from '@/enums/TransactionType'
import type { PlayersDict } from '@/types/Player'
import type { TransactionInfo } from '@/types/TransactionInfo'
import PlayerIndicator from '../atoms/PlayerIndicator'



type Props = {
    transactionsHistory: TransactionInfo[]
    playersDict: PlayersDict
}

const TransactionHistory = ({ transactionsHistory, playersDict }: Props) => {
    return (
        <div className='w-full flex flex-col mx-auto overflow-auto mt-auto text-center'>
            {transactionsHistory.map((transaction, i) => <div key={i} className='w-full flex gap-1'>{translateTransaction(transaction, playersDict)}</div>)}
        </div>
    )
}

const translateTransaction = (transaction: TransactionInfo, playersDict: PlayersDict) => {
    const { senderId, receiverId, amount, transactionType } = transaction;

    const sender = senderId ? playersDict[senderId] : null
    const receiver = receiverId ? playersDict[receiverId] : null

    switch (transactionType) {
        case TransactionType.Rent:
            return <>
                <PlayerIndicator player={sender!} /> paid ${amount} in rent to <PlayerIndicator player={receiver!} />.
            </>;
        case TransactionType.Salary:
            return <>
                <PlayerIndicator player={receiver!} /> received a salary of ${amount}.
            </>;
        case TransactionType.Buy:
            return <>
                <PlayerIndicator player={sender!} /> bought a property for ${amount}.
            </>;
        case TransactionType.Sell:
            return <>
                <PlayerIndicator player={receiver!} /> sold a property for ${amount}.
            </>;
        case TransactionType.Upgrade:
            return <>
                <PlayerIndicator player={sender!} /> ${amount} to upgrade a property.
            </>;
        case TransactionType.Downgrade:
            return <>
                <PlayerIndicator player={receiver!} /> received ${amount} for downgrading a property.
            </>;
        case TransactionType.Mortgage:
            return <>
                <PlayerIndicator player={receiver!} /> mortgaged a property and received ${amount}.
            </>;
        case TransactionType.Unmortgage:
            return <>
                <PlayerIndicator player={sender!} /> paid ${amount} to unmortgage a property.
            </>;
        case TransactionType.Fine:
            return <>
                <PlayerIndicator player={sender!} /> paid a fine of ${amount}.
            </>;
        case TransactionType.Trade:
            return <>
                <PlayerIndicator player={sender!} /> paid <PlayerIndicator player={receiver!} /> ${amount} as part of a trade.
            </>;
        case TransactionType.FreeFromJail:
            return <>
                <PlayerIndicator player={receiver!} /> used a Get Out of Jail Free card and received ${amount}.
            </>;
        default:
            return `An unknown transaction occurred with amount $${amount}.`;
    }
};

export default TransactionHistory