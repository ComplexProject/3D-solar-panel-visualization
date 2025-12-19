type Props= {
    toolTipText: string
    toolTipPosition?: string
}

/**
 * React component that has the styling of the tooltip
 * @param toolTipPosition - decided where the tooltip should be positioned
 * @param toolTipText - text of the tooltip
 * @returns Tooltip component
 */
function ToolTip({ toolTipPosition='left', toolTipText}:Props){
    return (
        <div className={`absolute z-50 pl-8 pt-1 pr-4 hidden group-hover:flex ${toolTipPosition === 'left' ? 'right-10' : 'left-0'} justify-center items-center drop-shadow-xl`}>
            <div className='bg-[#0B1215] p-1 rounded-md px-1.5 text-white'>
                <p>{toolTipText}</p>
            </div>
        </div>
    )
}

export default ToolTip