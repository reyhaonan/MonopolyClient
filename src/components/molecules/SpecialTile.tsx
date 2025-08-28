import type { SpecialSpace } from '@/types/BoardSpace'
import { SpecialSpaceType } from '@/types/SpecialSpaceType'
import classNames from 'classnames'

type Props = {
    space: SpecialSpace
    orientation: "top" | "bottom" | "left" | "right",
}

const SpecialTile = ({ space, orientation }: Props) => {
    if (space.type == SpecialSpaceType.Chance) {
        space
    }
    return (
        <div
            className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none'}>
            <div className={classNames("text-center font-bold py-2 absolute text-xs",
                orientation === "bottom" && "left-1/2 -translate-x-1/2 bottom-0",
                orientation === "top" && "left-1/2 -translate-x-1/2 top-0",
                orientation === "right" && "top-1/2 -translate-y-1/2 right-0",
                orientation === "left" && "top-1/2 -translate-y-1/2 left-0",
            )}>
                {space.name}
            </div>
            <div className="opacity-0 text-sm">PHROLOVA</div>
        </div>
    )
}

export default SpecialTile