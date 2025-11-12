import { render, screen } from '@testing-library/react'
import { it, expect, describe } from 'vitest'
import ProducedSolarEnergy from '../../energyResultsComponents/ProducedSolarEnergy'
 '../../energyResultsComponents/ProducedSolarEnergy'


describe('Solar panel displayed', () => {
    it('should display solar panel number', () => {
        const panelNumber = 5;
        const producedEnergy = 250;
        render(<ProducedSolarEnergy panelNumber={panelNumber} producedEnergy={producedEnergy} />)
        expect(screen.getByText(`PV ${panelNumber}`)).toBeInTheDocument()
})

    it('should display solar panel energy', () => {
        const panelNumber = 5;
        const producedEnergy = 250;
        render(<ProducedSolarEnergy panelNumber={panelNumber} producedEnergy={producedEnergy} />)
        expect(screen.getByText(new RegExp(`${producedEnergy}\\s* kWp`))).toBeInTheDocument()
    })
});
