import { TransactionType } from '@/enums/TransactionType'
import type { Player } from '@/types/Player'
import type { TransactionInfo } from '@/types/TransactionInfo'

type PlayerDict = { [key: Player['id']]: Player }

type Props = {
    transactionsHistory: TransactionInfo[]
    playersFromId: PlayerDict
}

const TransactionHistory = ({ transactionsHistory, playersFromId }: Props) => {
    return (
        <div className='w-2/3 h-1/4 flex flex-col-reverse mx-auto overflow-auto mt-auto text-center'>
            {transactionsHistory.map((transaction, i) => <div key={i} className='w-full'>{translateTransaction(transaction, playersFromId)}</div>)}
        </div>
    )
}

const translateTransaction = (transaction: TransactionInfo, playersFromId: PlayerDict) => {
    const { senderId, receiverId, amount, transactionType } = transaction;

    const sender = senderId ? playersFromId[senderId] : null
    const receiver = receiverId ? playersFromId[receiverId] : null

    switch (transactionType) {
        case TransactionType.Rent:
            return <>
                <span className='font-semibold'>{sender?.name}</span> paid ${amount} in rent to <span className='font-semibold'>{receiver?.name}</span>.
            </>;
        case TransactionType.Salary:
            return <>
                <span className='font-semibold'>{receiver?.name}</span> received a salary of ${amount}.
            </>;
        case TransactionType.Buy:
            if (transaction.isTransactionWithBank) {
                return <>
                    <span className='font-semibold'>{sender?.name}</span> bought a property for ${amount}.
                </>;
            }
            return <>
                <span className='font-semibold'>{sender?.name}</span> bought an item from <span className='font-semibold'>{receiver?.name}</span> for ${amount}.
            </>;
        case TransactionType.Sell:
            if (transaction.isTransactionWithBank) {
                return <>
                    <span className='font-semibold'>{sender?.name}</span> sold a property for ${amount}.
                </>;
            }
            return <>
                <span className='font-semibold'>{sender?.name}</span> sold an item to <span className='font-semibold'>{receiver?.name}</span> for ${amount}.
            </>;
        case TransactionType.Upgrade:
            return <>
                <span className='font-semibold'>{sender?.name}</span> ${amount} to upgrade a property.
            </>;
        case TransactionType.Downgrade:
            return <>
                <span className='font-semibold'>{sender?.name}</span> received ${amount} for downgrading a property.
            </>;
        case TransactionType.Mortgage:
            return <>
                <span className='font-semibold'>{sender?.name}</span> mortgaged a property and received ${amount}.
            </>;
        case TransactionType.Unmortgage:
            return <>
                <span className='font-semibold'>{sender?.name}</span> paid ${amount} to unmortgage a property.
            </>;
        case TransactionType.Fine:
            return <>
                <span className='font-semibold'>{sender?.name}</span> paid a fine of ${amount}.
            </>;
        case TransactionType.Trade:
            return <>
                <span className='font-semibold'>{sender?.name}</span> paid <span className='font-semibold'>{receiver?.name}</span> ${amount} as part of a trade.
            </>;
        case TransactionType.FreeFromJail:
            return <>
                <span className='font-semibold'>{receiver?.name}</span> used a Get Out of Jail Free card and received ${amount}.
            </>;
        default:
            return `An unknown transaction occurred with amount $${amount}.`;
    }
};

export default TransactionHistory