import { useEffect, type ReactNode, type Ref } from 'react'

type Props = {
    children: ReactNode,
    ref: Ref<HTMLDialogElement>,
    onClose: () => void
}

const Modal = ({ children, ref, onClose }: Props) => {

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    return (
        <dialog className='modal' ref={ref}>
            <div className="modal-box">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
                {children}
            </div>
            <div onClick={onClose} className="modal-backdrop"></div>
        </dialog>
    )
}

export default Modal