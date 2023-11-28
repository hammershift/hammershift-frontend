import React, { useState, FC } from 'react';
import { ICountry, IState, Country, State } from 'country-state-city';

interface CountryAndStateProps {
  onCountryChange: (countryCode: string) => void;
  onStateChange: (stateCode: string) => void;
}

const CountryAndState: FC<CountryAndStateProps> = ({ onCountryChange, onStateChange }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('');

  const handleCountrySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = event.target.value;
    setSelectedCountryCode(countryCode);
    onCountryChange(countryCode);
  };

  const handleStateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = event.target.value;
    setSelectedStateCode(stateCode);
    onStateChange(stateCode);
  };

  return (
    <div>
      <select onChange={handleCountrySelect} value={selectedCountryCode}>
        <option value=''>Select Country</option>
        {Country.getAllCountries().map((country: ICountry) => (
          <option key={country.isoCode} value={country.isoCode}>
            {country.name}
          </option>
        ))}
      </select>

      {selectedCountryCode && (
        <select onChange={handleStateSelect} value={selectedStateCode}>
          <option value=''>Select State</option>
          {State.getStatesOfCountry(selectedCountryCode).map((state: IState) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CountryAndState;
