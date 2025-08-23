import type { GameConfig } from '@/types/GameConfig'
import React from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    gameConfig: GameConfig
    onUpdateGameConfig: (gameConfig: GameConfig) => void
    disabled: boolean
}

const GameConfigForm = ({ gameConfig, onUpdateGameConfig, disabled }: Props) => {

    return (
        <div className='space-y-2'>
            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Free parking pot</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <input disabled={disabled} type="checkbox" checked={gameConfig.freeParkingPot} onChange={() => onUpdateGameConfig({ ...gameConfig, freeParkingPot: !gameConfig.freeParkingPot })} className="toggle" />
            </div>

            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Double base rent on full set</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <input disabled={disabled} type="checkbox" checked={gameConfig.doubleBaseRentOnFullColorSet} onChange={() => onUpdateGameConfig({ ...gameConfig, doubleBaseRentOnFullColorSet: !gameConfig.doubleBaseRentOnFullColorSet })} className="toggle" />
            </div>

            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Allow collect rent on jail</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <input disabled={disabled} type="checkbox" checked={gameConfig.allowCollectRentOnJail} onChange={() => onUpdateGameConfig({ ...gameConfig, allowCollectRentOnJail: !gameConfig.allowCollectRentOnJail })} className="toggle" />
            </div>

            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Allow mortgage</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <input disabled={disabled} type="checkbox" checked={gameConfig.allowMortgagingProperties} onChange={() => onUpdateGameConfig({ ...gameConfig, allowMortgagingProperties: !gameConfig.allowMortgagingProperties })} className="toggle" />
            </div>

            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Balanced house</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <input disabled={disabled} type="checkbox" checked={gameConfig.balancedHousePurchase} onChange={() => onUpdateGameConfig({ ...gameConfig, balancedHousePurchase: !gameConfig.balancedHousePurchase })} className="toggle" />
            </div>

            <div className="flex items-center justify-between">
                <div className="rule">
                    <h2 className='font-semibold'>Starting money</h2>
                    <p className='text-xs opacity-50'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, est!</p>
                </div>
                <select disabled={disabled} value={gameConfig.startingMoney} className="select w-fit" onChange={e => onUpdateGameConfig({ ...gameConfig, startingMoney: Number(e.target.value) })}>
                    <option disabled={true}>Starting money</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={1500}>1500</option>
                    <option value={2000}>2000</option>
                    <option value={3000}>3000</option>
                </select>
            </div>

        </div>
    )
}

export default GameConfigForm