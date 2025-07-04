import React, { useState, useEffect } from 'react';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';

interface SearchInputProps {
    id: string;
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    id,
    label,
    placeholder,
    value,
    onChange,
}) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        onChange(newValue);
    };

    return (
        <SearchBar
            id={id}
            label={label}
            renderInput={({ id, type, className }) => (
                <input
                    id={id}
                    type={type}
                    className={className}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
            )}
            onButtonClick={handleInputChange}
            clearInputOnSearch={false}
        />
    );
}; 