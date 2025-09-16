import type { SpecialSpace } from '@/types/BoardSpace'
import { SpecialSpaceType } from '@/types/SpecialSpaceType'
import classNames from 'classnames'
import { Popover, type PopoverPosition } from 'react-tiny-popover'

type Props = {
    space: SpecialSpace
    orientation: "top" | "bottom" | "left" | "right",
    popoverMessage?: string,
}

const SpecialTile = ({ space, orientation, popoverMessage }: Props) => {

    const getPopoverPosition = (): PopoverPosition[] => {
        switch (orientation) {
            case "top":
                return ["bottom"]
            case "bottom":
                return ["top"]
            case "left":
                return ["right"]
            case "right":
                return ["left"]
        }
    }

    return (
        <Popover
            isOpen={!!popoverMessage}
            positions={getPopoverPosition()}
            padding={10}
            containerClassName='z-30'
            content={() => (
                <div tabIndex={0}
                    className="select-none w-52 bg-base-100 p-4 rounded-box shadow-xl"
                    style={{
                        writingMode: "horizontal-tb"
                    }}>
                    <h3 className="text-2xl font-semibold mb-2">
                        {space.name}
                    </h3>

                    {popoverMessage}
                </div>
            )}>
            <div
                className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none'}>
                <div className={classNames("text-center font-semibold py-2 absolute text-xs flex gap-2",
                    orientation === "bottom" && "left-1/2 -translate-x-1/2 bottom-0 flex-col",
                    orientation === "top" && "left-1/2 -translate-x-1/2 top-0 flex-col-reverse",
                    orientation === "right" && "top-1/2 -translate-y-1/2 right-0 flex-col",
                    orientation === "left" && "top-1/2 -translate-y-1/2 left-0 flex-col",
                )}>
                    {space.type == SpecialSpaceType.Treasure &&
                        <>
                            <div className='text-6xl font-bold opacity-30'>$</div>
                        </>
                    }
                    {space.type == SpecialSpaceType.Chance &&
                        <>
                            <div className='text-6xl font-bold opacity-30'>?</div>
                        </>
                    }
                    {space.type == SpecialSpaceType.IncomeTax &&
                        <>
                            <div className='text-xl font-bold opacity-40'>$200</div>
                        </>
                    }
                    {space.type == SpecialSpaceType.LuxuryTax &&
                        <>
                            <div className='text-xl font-bold opacity-40'>$100</div>
                        </>
                    }
                    {space.name}
                </div>
                <div className="opacity-0 text-sm">PHROLOVA</div>
            </div>
        </Popover>

    )
}

export default SpecialTile

