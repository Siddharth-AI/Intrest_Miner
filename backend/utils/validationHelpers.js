const isValidDate = (value, helpers) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? helpers.error('date.invalid') : date;
};

const validateSearchText = (text) => {
    if (!text || typeof text !== 'string') {
        return { valid: false, message: 'Search text must be a string' };
    }
    
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return { valid: false, message: 'Search text cannot be empty' };
    }
    
    if (trimmed.length > 1000) {
        return { valid: false, message: 'Search text cannot exceed 1000 characters' };
    }
    
    // Check for potentially dangerous characters
    if (/[<>]/.test(trimmed)) {
        return { valid: false, message: 'Search text contains invalid characters' };
    }
    
    return { valid: true };
};

module.exports = {
    isValidDate,
    validateSearchText
};