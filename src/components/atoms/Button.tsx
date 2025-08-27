import { type ButtonHTMLAttributes } from 'react'

type Props = {
    isLoading?: boolean
}

const Button = ({ isLoading = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Props) => {
    return (
        <button {...props} disabled={props.disabled || isLoading}>
            {isLoading ? <span className="loading loading-spinner"></span>
                : props.children}
        </button>
    )
}

export default Button