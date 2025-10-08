type FormButtonProps = {
    buttonText: string;
    isClosingButton?: boolean;
    onClick?: () => void;
};

function FormButton({ buttonText, isClosingButton = false, onClick }: FormButtonProps) {
    return (
        <button
            className={`hover:scale-105 drop-shadow-sm cursor-pointer rounded-xl py-0.5 w-full border-2 border-[#006FAA] ${isClosingButton
                    ? 'bg-white text-[#006FAA]'
                    : 'bg-[#006FAA] text-white'
                }`}
            onClick={onClick}>
            {buttonText}
        </button>
    );
}


export default FormButton